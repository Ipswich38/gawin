'use client';

import React, { useState, useEffect } from 'react';
import { Camera, CameraOff, Monitor, MonitorOff, Volume2, VolumeX, Eye } from 'lucide-react';
import { simpleVisionService, SimpleVisionState } from '@/lib/services/simpleVisionService';
import { voiceService } from '@/lib/services/voiceService';
import { hapticService } from '@/lib/services/hapticService';

interface SimpleVisionProps {
  onVisionToggle?: () => void;
  isVisionActive?: boolean;
  compact?: boolean;
}

const SimpleVision: React.FC<SimpleVisionProps> = ({ onVisionToggle, isVisionActive = false, compact = false }) => {
  const [visionState, setVisionState] = useState<SimpleVisionState>({
    cameraEnabled: false,
    screenEnabled: false,
    stream: null,
    screenStream: null
  });
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  useEffect(() => {
    // Subscribe to vision state changes
    const unsubscribe = simpleVisionService.subscribe(setVisionState);
    
    // Get initial state
    setVisionState(simpleVisionService.getState());
    setVoiceEnabled(voiceService.isVoiceEnabled());
    
    return unsubscribe;
  }, []);

  const handleCameraToggle = async (): Promise<boolean> => {
    // Trigger haptic feedback for camera control
    hapticService.triggerHaptic('vision');

    if (visionState.cameraEnabled) {
      simpleVisionService.disableCamera();
      setTimeout(() => hapticService.triggerStateChange(false), 100);
      return true;
    } else {
      const success = await simpleVisionService.enableCamera();
      if (!success) {
        alert('Camera access denied. Please check your browser permissions.');
        hapticService.triggerError();
        return false;
      } else {
        setTimeout(() => hapticService.triggerStateChange(true), 100);
        return true;
      }
    }
  };

  const handleScreenToggle = async () => {
    // Trigger haptic feedback for screen control
    hapticService.triggerHaptic('screenShare');

    if (visionState.screenEnabled) {
      simpleVisionService.disableScreen();
      setTimeout(() => hapticService.triggerStateChange(false), 100);
    } else {
      const success = await simpleVisionService.enableScreen();
      if (!success) {
        alert('Screen capture denied or not supported.');
        hapticService.triggerError();
      } else {
        setTimeout(() => hapticService.triggerStateChange(true), 100);
      }
    }
  };

  const handleVoiceToggle = async () => {
    // Trigger haptic feedback for voice control
    hapticService.triggerHaptic('voice');

    if (voiceEnabled) {
      voiceService.disableVoice();
      setVoiceEnabled(false);
      setTimeout(() => hapticService.triggerStateChange(false), 100);
    } else {
      const success = await voiceService.enableVoice();
      setVoiceEnabled(success);
      if (!success) {
        alert('Voice synthesis not supported in this browser.');
        hapticService.triggerError();
      } else {
        setTimeout(() => hapticService.triggerStateChange(true), 100);
      }
    }
  };

  if (compact) {
    // Compact version for input area - Single Vision Toggle
    return (
      <div className="flex items-center space-x-2">
        {/* Single Vision Toggle Button */}
        <div className="relative">
          <button
            onClick={async () => {
              // Trigger haptic feedback for vision control
              hapticService.triggerHaptic('vision');

              if (visionState.cameraEnabled) {
                // Turn off both camera and vision POV
                simpleVisionService.disableCamera();
                if (onVisionToggle && isVisionActive) {
                  onVisionToggle();
                }
                // Haptic feedback for deactivation
                setTimeout(() => hapticService.triggerStateChange(false), 100);
              } else {
                // Turn on camera and automatically show vision POV
                const success = await handleCameraToggle();
                if (success && onVisionToggle && !isVisionActive) {
                  onVisionToggle();
                }
                // Haptic feedback based on success
                if (success) {
                  setTimeout(() => hapticService.triggerStateChange(true), 100);
                } else {
                  hapticService.triggerError();
                }
              }
            }}
            disabled={!simpleVisionService.isCameraSupported()}
            className={`
              w-7 h-7 rounded-lg flex items-center justify-center
              transition-all duration-200
              ${visionState.cameraEnabled
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/60 hover:text-gray-300'
              }
              ${!simpleVisionService.isCameraSupported() ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={visionState.cameraEnabled ? 'Disable Gawin\'s Vision (Braille: ⠧)' : 'Enable Gawin\'s Vision (Braille: ⠧)'}
          >
            <Eye size={14} />
          </button>

          {/* Status indicator dot */}
          {visionState.cameraEnabled && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
          )}
        </div>
      </div>
    );
  }

  // Full version for other areas
  return (
    <div className="flex items-center space-x-2">
      {/* Camera Button */}
      <button
        onClick={handleCameraToggle}
        disabled={!simpleVisionService.isCameraSupported()}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
          ${visionState.cameraEnabled
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border border-gray-500/30'
          }
          ${!simpleVisionService.isCameraSupported() ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={visionState.cameraEnabled ? 'Stop Camera' : 'Enable Camera'}
      >
        {visionState.cameraEnabled ? <CameraOff size={16} /> : <Camera size={16} />}
        <span className="hidden sm:inline">
          {visionState.cameraEnabled ? 'Cam On' : 'Camera'}
        </span>
      </button>

      {/* Screen Button */}
      <button
        onClick={handleScreenToggle}
        disabled={!simpleVisionService.isScreenSupported()}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
          ${visionState.screenEnabled
            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border border-gray-500/30'
          }
          ${!simpleVisionService.isScreenSupported() ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={visionState.screenEnabled ? 'Stop Screen' : 'Enable Screen'}
      >
        {visionState.screenEnabled ? <MonitorOff size={16} /> : <Monitor size={16} />}
        <span className="hidden sm:inline">
          {visionState.screenEnabled ? 'Screen On' : 'Screen'}
        </span>
      </button>

      {/* Voice Button */}
      <button
        onClick={handleVoiceToggle}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
          ${voiceEnabled
            ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30'
            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border border-gray-500/30'
          }
        `}
        title={voiceEnabled ? 'Disable Voice' : 'Enable Voice'}
      >
        {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        <span className="hidden sm:inline">
          {voiceEnabled ? 'Voice On' : 'Voice'}
        </span>
      </button>

      {/* Vision POV Toggle */}
      {visionState.cameraEnabled && onVisionToggle && (
        <button
          onClick={onVisionToggle}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${isVisionActive
              ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30'
              : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border border-gray-500/30'
            }
          `}
          title="Toggle Gawin's Vision POV"
        >
          <Eye size={16} />
          <span className="hidden sm:inline">
            {isVisionActive ? 'Vision On' : 'Vision'}
          </span>
        </button>
      )}

      {/* Status Indicator */}
      {(visionState.cameraEnabled || visionState.screenEnabled || voiceEnabled) && (
        <div className="flex items-center space-x-1 text-xs text-green-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="hidden sm:inline">Active</span>
        </div>
      )}
    </div>
  );
};

export default SimpleVision;