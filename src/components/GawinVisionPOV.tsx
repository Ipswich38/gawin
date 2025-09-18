/**
 * Gawin's Vision POV - AI Vision Overlay Component
 * Shows what Gawin sees through the camera with AI detection squares and labels
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Target, Brain, Camera } from 'lucide-react';
import { intelligentVisionService, IntelligentVisionAnalysis, VisionPoint } from '@/lib/services/intelligentVisionService';
import { simpleVisionService } from '@/lib/services/simpleVisionService';

interface GawinVisionPOVProps {
  isVisible: boolean;
  onToggle: () => void;
}

const GawinVisionPOV: React.FC<GawinVisionPOVProps> = ({ isVisible, onToggle }) => {
  const [currentAnalysis, setCurrentAnalysis] = useState<IntelligentVisionAnalysis | null>(null);
  const [visionPoints, setVisionPoints] = useState<VisionPoint[]>([]);
  const [isIntelligentMode, setIsIntelligentMode] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draggable state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to intelligent vision updates
    const unsubscribeIntelligent = intelligentVisionService.subscribe((analysis) => {
      setCurrentAnalysis(analysis);
      setVisionPoints(intelligentVisionService.getVisionPoints());
    });

    // Check if intelligent mode is enabled
    setIsIntelligentMode(intelligentVisionService.isIntelligentModeEnabled());

    // Subscribe to camera stream updates
    const unsubscribeSimple = simpleVisionService.subscribe((state) => {
      setCameraStream(state.stream);
    });

    return () => {
      unsubscribeIntelligent();
      unsubscribeSimple();
    };
  }, []);

  useEffect(() => {
    // Set up video stream
    if (cameraStream && videoRef.current && isVisible) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(console.error);
    }
  }, [cameraStream, isVisible]);

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep panel within viewport bounds
      const maxX = window.innerWidth - 320; // panel width
      const maxY = window.innerHeight - 256; // panel height

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const formatConfidence = (confidence: number): string => {
    return `${(confidence * 100).toFixed(0)}%`;
  };

  const getStatusColor = (confidence: number): string => {
    if (confidence > 0.8) return 'text-green-400';
    if (confidence > 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusText = (): string => {
    if (!currentAnalysis) return 'Initializing vision...';
    if (!cameraStream) return 'Camera not active';
    if (isIntelligentMode) return 'Advanced AI Vision';
    return 'Basic Vision Active';
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-20 right-4 w-12 h-12 bg-purple-600/80 hover:bg-purple-500/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 z-40 shadow-lg border border-purple-500/30"
        title="Show Gawin's Vision POV"
      >
        <Eye size={20} className="text-white" />
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: position.x,
          y: position.y
        }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`fixed w-80 h-64 bg-gray-900/95 backdrop-blur-lg border border-gray-600/50 rounded-2xl shadow-2xl z-50 overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          right: position.x === 0 ? '1rem' : 'auto',
          bottom: position.x === 0 ? '1rem' : 'auto',
          left: position.x > 0 ? `${position.x}px` : 'auto',
          top: position.y > 0 ? `${position.y}px` : 'auto'
        }}
      >
        {/* Header */}
        <div
          className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 px-4 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Brain size={16} className="text-white" />
              {isIntelligentMode && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <span className="text-white text-sm font-medium">Gawin's Vision</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`text-xs ${currentAnalysis ? getStatusColor(currentAnalysis.confidence) : 'text-gray-400'}`}>
              {currentAnalysis && formatConfidence(currentAnalysis.confidence)}
            </div>
            <button
              onClick={onToggle}
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <EyeOff size={14} className="text-white" />
            </button>
          </div>
        </div>

        {/* Video Feed with AI Overlay */}
        <div className="relative h-40 bg-black">
          {cameraStream ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              
              {/* AI Detection Overlay */}
              <div className="absolute inset-0">
                {/* Detection squares and labels */}
                {visionPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute border-2 border-opacity-80"
                    style={{
                      left: `${(point.x / 640) * 100}%`,
                      top: `${(point.y / 480) * 100}%`,
                      width: `${(point.width / 640) * 100}%`,
                      height: `${(point.height / 480) * 100}%`,
                      borderColor: point.color,
                    }}
                  >
                    {/* Label */}
                    <div 
                      className="absolute -top-6 left-0 px-2 py-1 rounded text-xs font-medium text-white text-shadow"
                      style={{ backgroundColor: point.color }}
                    >
                      {point.label}
                    </div>
                    
                    {/* Tracking dot */}
                    <div 
                      className="absolute top-1 right-1 w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: point.color }}
                    ></div>
                  </motion.div>
                ))}

                {/* Central targeting reticle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <Target size={24} className="text-white/50" />
                    <div className="absolute inset-0 animate-ping">
                      <Target size={24} className="text-purple-400/30" />
                    </div>
                  </div>
                </div>

                {/* Scanning animation */}
                <motion.div
                  animate={{ 
                    y: [-20, 180, -20],
                    opacity: [0.7, 0.3, 0.7]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Camera size={32} className="mx-auto mb-2 opacity-50" />
                <div className="text-sm">Camera not active</div>
              </div>
            </div>
          )}
        </div>

        {/* Status and Analysis Info */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-300">
              Status: <span className={currentAnalysis ? getStatusColor(currentAnalysis.confidence) : 'text-gray-400'}>
                {getStatusText()}
              </span>
            </div>
            {isIntelligentMode && (
              <div className="flex items-center space-x-1 text-xs text-green-400">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span>AI Enhanced</span>
              </div>
            )}
          </div>

          {currentAnalysis && (
            <div className="text-xs text-gray-300 space-y-1">
              <div className="truncate">
                Objects: {currentAnalysis.objects.length} detected
              </div>
              {currentAnalysis.faces.isPresent && (
                <div className="text-purple-300">
                  👤 Face detected ({Object.keys(currentAnalysis.faces.emotions)[0] || 'neutral'})
                </div>
              )}
              <div className="text-blue-300 truncate">
                Scene: {currentAnalysis.scene.setting} ({currentAnalysis.scene.lighting})
              </div>
            </div>
          )}
        </div>

        {/* Processing indicator */}
        {currentAnalysis && (
          <div className="absolute top-12 right-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default GawinVisionPOV;