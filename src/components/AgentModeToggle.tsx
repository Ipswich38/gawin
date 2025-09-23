/**
 * Agent Mode Toggle Component
 * Premium feature toggle for enhanced AI agent capabilities
 */

'use client';

import React, { useState, useEffect } from 'react';
import PremiumFeatureGate from './PremiumFeatureGate';

interface AgentModeToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export function AgentModeToggle({ isEnabled, onToggle, className = '' }: AgentModeToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      onToggle(!isEnabled);

      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };

  return (
    <PremiumFeatureGate
      featureName="Agent Mode"
      description="Unlock enhanced AI capabilities with comprehensive research, structured analysis, and premium formatting."
    >
      <div className={`agent-mode-toggle ${className}`}>
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          disabled={isAnimating}
          className={`agent-toggle-btn ${isEnabled ? 'enabled' : 'disabled'} ${isAnimating ? 'animating' : ''}`}
          aria-label={`Agent Mode ${isEnabled ? 'enabled' : 'disabled'}`}
        >
          {/* Icon Container */}
          <div className="toggle-icon-container">
            <div className={`agent-icon ${isEnabled ? 'active' : ''}`}>
              🤖
            </div>
            <div className={`regular-icon ${!isEnabled ? 'active' : ''}`}>
              💬
            </div>
          </div>

          {/* Status Indicator */}
          <div className="toggle-slider">
            <div className={`slider-track ${isEnabled ? 'on' : 'off'}`}>
              <div className="slider-thumb" />
            </div>
          </div>

          {/* Label */}
          <span className="toggle-label">
            Agent Mode
          </span>

          {/* Premium Badge */}
          <div className="premium-badge">
            ✨ Premium
          </div>
        </button>

        {/* Status Description */}
        <div className="agent-status-description">
          {isEnabled ? (
            <div className="status-enabled">
              <span className="status-icon">🚀</span>
              <span>Enhanced AI capabilities active</span>
            </div>
          ) : (
            <div className="status-disabled">
              <span className="status-icon">💡</span>
              <span>Regular response mode</span>
            </div>
          )}
        </div>

        {/* Feature List */}
        {isEnabled && (
          <div className="agent-features">
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Comprehensive research & analysis</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>Structured & organized responses</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✨</span>
              <span>Premium formatting & layout</span>
            </div>
          </div>
        )}

        <style jsx>{`
          .agent-mode-toggle {
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-width: 320px;
          }

          .agent-toggle-btn {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border: 2px solid #404040;
            border-radius: 16px;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }

          .agent-toggle-btn:hover {
            border-color: #00d4ff;
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
            transform: translateY(-2px);
          }

          .agent-toggle-btn.enabled {
            background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
            border-color: #00d4ff;
            box-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
          }

          .agent-toggle-btn.enabled:hover {
            box-shadow: 0 0 40px rgba(0, 212, 255, 0.6);
          }

          .agent-toggle-btn.animating {
            transform: scale(0.98);
          }

          .agent-toggle-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .toggle-icon-container {
            position: relative;
            width: 24px;
            height: 24px;
          }

          .agent-icon,
          .regular-icon {
            position: absolute;
            top: 0;
            left: 0;
            font-size: 20px;
            transition: all 0.3s ease;
            opacity: 0;
            transform: scale(0.8) rotate(-10deg);
          }

          .agent-icon.active,
          .regular-icon.active {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }

          .toggle-slider {
            flex: 1;
            display: flex;
            align-items: center;
          }

          .slider-track {
            width: 60px;
            height: 30px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            position: relative;
            transition: background-color 0.3s ease;
          }

          .slider-track.on {
            background: rgba(255, 255, 255, 0.2);
          }

          .slider-thumb {
            width: 26px;
            height: 26px;
            background: white;
            border-radius: 13px;
            position: absolute;
            top: 2px;
            left: 2px;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }

          .slider-track.on .slider-thumb {
            transform: translateX(30px);
            background: #00d4ff;
          }

          .toggle-label {
            font-weight: 600;
            min-width: 80px;
          }

          .premium-badge {
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
            color: white;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .agent-status-description {
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .status-enabled,
          .status-disabled {
            display: flex;
            align-items: center;
            gap: 8px;
            color: white;
            font-size: 13px;
          }

          .status-enabled {
            color: #00d4ff;
          }

          .status-icon {
            font-size: 16px;
          }

          .agent-features {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 16px;
            background: rgba(0, 212, 255, 0.1);
            border-radius: 12px;
            border: 1px solid rgba(0, 212, 255, 0.2);
            animation: slideIn 0.3s ease-out;
          }

          .feature-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: white;
            font-size: 12px;
          }

          .feature-icon {
            font-size: 14px;
            opacity: 0.8;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Mobile Responsive */
          @media (max-width: 768px) {
            .agent-mode-toggle {
              max-width: 100%;
            }

            .agent-toggle-btn {
              padding: 14px 16px;
              font-size: 13px;
            }

            .toggle-icon-container {
              width: 20px;
              height: 20px;
            }

            .agent-icon,
            .regular-icon {
              font-size: 18px;
            }

            .slider-track {
              width: 50px;
              height: 26px;
            }

            .slider-thumb {
              width: 22px;
              height: 22px;
            }

            .slider-track.on .slider-thumb {
              transform: translateX(24px);
            }

            .premium-badge {
              font-size: 9px;
              padding: 3px 6px;
            }

            .feature-item {
              font-size: 11px;
            }
          }
        `}</style>
      </div>
    </PremiumFeatureGate>
  );
}

/**
 * Mini Agent Mode Indicator for Compact Spaces
 */
export function AgentModeIndicator({ isEnabled }: { isEnabled: boolean }) {
  if (!isEnabled) return null;

  return (
    <div className="agent-mode-indicator-mini">
      <span className="indicator-icon">🤖</span>
      <span className="indicator-text">Agent</span>

      <style jsx>{`
        .agent-mode-indicator-mini {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
          color: white;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3);
        }

        .indicator-icon {
          font-size: 12px;
        }

        .indicator-text {
          line-height: 1;
        }
      `}</style>
    </div>
  );
}