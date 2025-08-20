import React, { useState, useEffect } from 'react';

interface AnimatedVideoPreviewProps {
  frames: string[];
  style?: React.CSSProperties;
  alt?: string;
}

const AnimatedVideoPreview: React.FC<AnimatedVideoPreviewProps> = ({ 
  frames, 
  style,
  alt = "Animated video preview"
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || frames.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % frames.length);
    }, 100); // 10 FPS

    return () => clearInterval(interval);
  }, [frames.length, isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  if (!frames || frames.length === 0) {
    return null;
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <img
        src={frames[currentFrame] || frames[0]}
        alt={alt}
        style={style}
        onClick={togglePlayback}
      />
      
      {/* Play/Pause Overlay */}
      <div 
        onClick={togglePlayback}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '16px',
          padding: '4px 8px',
          fontSize: '12px',
          cursor: 'pointer',
          userSelect: 'none',
          fontFamily: 'monospace',
        }}
      >
        {isPlaying ? '⏸️' : '▶️'} {frames.length}f
      </div>
      
      {/* Frame Counter */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        borderRadius: '12px',
        padding: '2px 6px',
        fontSize: '10px',
        fontFamily: 'monospace',
      }}>
        {currentFrame + 1}/{frames.length}
      </div>
    </div>
  );
};

export default AnimatedVideoPreview;