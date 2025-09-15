'use client';

import React, { useState, useEffect } from 'react';
import { Camera, CameraOff, Monitor, MonitorOff } from 'lucide-react';
import { simpleVisionService, SimpleVisionState } from '@/lib/services/simpleVisionService';

const SimpleVision: React.FC = () => {
  const [visionState, setVisionState] = useState<SimpleVisionState>({
    cameraEnabled: false,
    screenEnabled: false,
    stream: null,
    screenStream: null
  });

  useEffect(() => {
    // Subscribe to vision state changes
    const unsubscribe = simpleVisionService.subscribe(setVisionState);
    
    // Get initial state
    setVisionState(simpleVisionService.getState());
    
    return unsubscribe;
  }, []);

  const handleCameraToggle = async () => {
    if (visionState.cameraEnabled) {
      simpleVisionService.disableCamera();
    } else {
      const success = await simpleVisionService.enableCamera();
      if (!success) {
        alert('Camera access denied. Please check your browser permissions.');
      }
    }
  };

  const handleScreenToggle = async () => {
    if (visionState.screenEnabled) {
      simpleVisionService.disableScreen();
    } else {
      const success = await simpleVisionService.enableScreen();
      if (!success) {
        alert('Screen capture denied or not supported.');
      }
    }
  };

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

      {/* Status Indicator */}
      {(visionState.cameraEnabled || visionState.screenEnabled) && (
        <div className="flex items-center space-x-1 text-xs text-green-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="hidden sm:inline">Active</span>
        </div>
      )}
    </div>
  );
};

export default SimpleVision;