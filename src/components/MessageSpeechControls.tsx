'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';
import { voiceService } from '@/lib/services/voiceService';

interface MessageSpeechControlsProps {
  text: string;
  language?: 'english' | 'filipino' | 'taglish';
  className?: string;
}

export default function MessageSpeechControls({
  text,
  language = 'english',
  className = ''
}: MessageSpeechControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Listen for speech events to update button states
    const handleSpeechStart = () => setIsPlaying(true);
    const handleSpeechEnd = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    const handleSpeechPause = () => setIsPaused(true);
    const handleSpeechResume = () => setIsPaused(false);

    // Add event listeners if voiceService supports them
    if (typeof window !== 'undefined') {
      window.addEventListener('gawin-speech-start', handleSpeechStart);
      window.addEventListener('gawin-speech-end', handleSpeechEnd);
      window.addEventListener('gawin-speech-pause', handleSpeechPause);
      window.addEventListener('gawin-speech-resume', handleSpeechResume);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('gawin-speech-start', handleSpeechStart);
        window.removeEventListener('gawin-speech-end', handleSpeechEnd);
        window.removeEventListener('gawin-speech-pause', handleSpeechPause);
        window.removeEventListener('gawin-speech-resume', handleSpeechResume);
      }
    };
  }, []);

  const handlePlay = async () => {
    try {
      if (isPaused) {
        // Resume if paused
        voiceService.resumeSpeaking();
        setIsPaused(false);
      } else {
        // Start new speech with appropriate language mapping
        const voiceLanguage = language === 'filipino' ? 'fil-PH' :
                              language === 'taglish' ? 'en-PH' : 'en-US';

        await voiceService.speak({
          text: text,
          language: voiceLanguage,
          emotion: 'neutral'
        });
      }
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to start speech:', error);
    }
  };

  const handlePause = () => {
    try {
      voiceService.pauseSpeaking();
      setIsPaused(true);
    } catch (error) {
      console.error('Failed to pause speech:', error);
    }
  };

  const handleStop = () => {
    try {
      voiceService.stopSpeaking();
      setIsPlaying(false);
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to stop speech:', error);
    }
  };

  // Don't show controls if voice service is not available
  if (!voiceService.isVoiceEnabled()) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {!isPlaying || isPaused ? (
          <button
            onClick={handlePlay}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={isPaused ? "Resume speech" : "Play speech"}
          >
            <Play className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Pause speech"
          >
            <Pause className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        )}

        <button
          onClick={handleStop}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Stop speech"
          disabled={!isPlaying}
        >
          <Square className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />

        <div className="flex items-center gap-1 px-1">
          <Volume2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {language}
          </span>
        </div>
      </div>
    </div>
  );
}