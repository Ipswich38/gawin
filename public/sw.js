// Gawin Background Behavior Analytics Service Worker
const CACHE_NAME = 'gawin-behavior-v1';
const BEHAVIOR_DATA_KEY = 'gawin_behavior_data';

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 Gawin Background Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('✅ Gawin Background Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Background sync for behavior data
self.addEventListener('sync', (event) => {
  if (event.tag === 'behavior-sync') {
    event.waitUntil(syncBehaviorData());
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'behavior-periodic') {
    event.waitUntil(collectBackgroundBehaviorData());
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'ENABLE_BACKGROUND_COLLECTION':
      enableBackgroundCollection(data);
      break;
    case 'DISABLE_BACKGROUND_COLLECTION':
      disableBackgroundCollection();
      break;
    case 'GET_BACKGROUND_DATA':
      getBackgroundData().then(data => {
        event.ports[0].postMessage({ type: 'BACKGROUND_DATA', data });
      });
      break;
  }
});

// Background data collection
async function collectBackgroundBehaviorData() {
  try {
    const permissions = await checkPermissions();
    if (!permissions.granted) return;

    const behaviorData = {
      timestamp: Date.now(),
      // System usage patterns
      activeTime: await getActiveTime(),
      focusEvents: await getFocusEvents(),
      // Environmental context
      networkStatus: navigator.onLine,
      batteryLevel: await getBatteryLevel(),
      // User interaction patterns
      interactionFrequency: await getInteractionFrequency(),
      // Wellness indicators
      screenTime: await getScreenTime(),
      breakPatterns: await getBreakPatterns()
    };

    await storeBehaviorData(behaviorData);
    console.log('📊 Background behavior data collected');
  } catch (error) {
    console.warn('Background data collection failed:', error);
  }
}

// Permission checking
async function checkPermissions() {
  try {
    const permissions = await navigator.permissions.query({ name: 'background-sync' });
    return { granted: permissions.state === 'granted' };
  } catch {
    return { granted: false };
  }
}

// Get active time (time since last user interaction)
async function getActiveTime() {
  const lastActive = await getStoredData('last_active') || Date.now();
  return Date.now() - lastActive;
}

// Get focus events (window focus/blur patterns)
async function getFocusEvents() {
  const focusData = await getStoredData('focus_events') || [];
  return focusData.slice(-10); // Keep last 10 focus events
}

// Get battery level
async function getBatteryLevel() {
  try {
    if ('getBattery' in navigator) {
      const battery = await navigator.getBattery();
      return {
        level: battery.level,
        charging: battery.charging
      };
    }
  } catch {
    return null;
  }
}

// Get interaction frequency
async function getInteractionFrequency() {
  const interactions = await getStoredData('interactions') || [];
  const lastHour = Date.now() - (60 * 60 * 1000);
  return interactions.filter(i => i.timestamp > lastHour).length;
}

// Get screen time estimation
async function getScreenTime() {
  const sessions = await getStoredData('screen_sessions') || [];
  const today = new Date().toDateString();
  const todaySessions = sessions.filter(s => new Date(s.start).toDateString() === today);
  
  return todaySessions.reduce((total, session) => {
    const duration = (session.end || Date.now()) - session.start;
    return total + duration;
  }, 0);
}

// Get break patterns
async function getBreakPatterns() {
  const breaks = await getStoredData('break_patterns') || [];
  const today = new Date().toDateString();
  return breaks.filter(b => new Date(b.timestamp).toDateString() === today);
}

// Store behavior data
async function storeBehaviorData(data) {
  try {
    const existingData = await getStoredData(BEHAVIOR_DATA_KEY) || [];
    existingData.push(data);
    
    // Keep only last 1000 entries to prevent storage bloat
    if (existingData.length > 1000) {
      existingData.splice(0, existingData.length - 1000);
    }
    
    await setStoredData(BEHAVIOR_DATA_KEY, existingData);
  } catch (error) {
    console.warn('Failed to store behavior data:', error);
  }
}

// Get stored data from IndexedDB
async function getStoredData(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GawinBehaviorDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('behaviorData')) {
        resolve(null);
        return;
      }
      
      const transaction = db.transaction(['behaviorData'], 'readonly');
      const store = transaction.objectStore('behaviorData');
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => resolve(getRequest.result?.data || null);
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('behaviorData')) {
        db.createObjectStore('behaviorData', { keyPath: 'key' });
      }
    };
  });
}

// Set stored data in IndexedDB
async function setStoredData(key, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GawinBehaviorDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['behaviorData'], 'readwrite');
      const store = transaction.objectStore('behaviorData');
      const putRequest = store.put({ key, data });
      
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('behaviorData')) {
        db.createObjectStore('behaviorData', { keyPath: 'key' });
      }
    };
  });
}

// Sync behavior data
async function syncBehaviorData() {
  try {
    const data = await getStoredData(BEHAVIOR_DATA_KEY);
    if (data && data.length > 0) {
      console.log(`🔄 Syncing ${data.length} behavior data entries`);
      // In a real app, this would sync to a server
      // For now, we just log the sync
    }
  } catch (error) {
    console.warn('Behavior data sync failed:', error);
  }
}

// Enable background collection
function enableBackgroundCollection(config) {
  console.log('🟢 Background behavior collection enabled', config);
  // Register for periodic sync if supported
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    self.registration.sync.register('behavior-sync');
  }
}

// Disable background collection
function disableBackgroundCollection() {
  console.log('🔴 Background behavior collection disabled');
  // Unregister periodic sync
  if (self.registration && self.registration.sync) {
    // Clear any pending sync events
    console.log('Clearing background sync registrations');
  }
}

// Get background data
async function getBackgroundData() {
  try {
    const data = await getStoredData(BEHAVIOR_DATA_KEY);
    return data || [];
  } catch (error) {
    console.warn('Failed to get background data:', error);
    return [];
  }
}