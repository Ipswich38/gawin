import React, { useState, useEffect } from 'react';
import { systemGuardianService } from '../lib/services/systemGuardianService';
import { themeService } from '../lib/services/themeService';

interface SystemStatusIndicatorProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showDetails?: boolean;
}

/**
 * System Status Indicator
 * Shows current system health, security status, and performance metrics
 */
const SystemStatusIndicator: React.FC<SystemStatusIndicatorProps> = ({ 
  position = 'top-right',
  showDetails = false 
}) => {
  const [systemStatus, setSystemStatus] = useState(systemGuardianService.getSystemStatus());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(systemGuardianService.getSystemStatus());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (health: string, security: string) => {
    if (health === 'poor' || security === 'alert') return '#EF4444';
    if (health === 'fair' || security === 'warning') return '#F59E0B';
    if (health === 'good') return '#10B981';
    return '#059669'; // excellent
  };

  const getStatusIcon = (health: string, security: string) => {
    if (health === 'poor' || security === 'alert') return '🚨';
    if (health === 'fair' || security === 'warning') return '⚠️';
    if (health === 'good') return '✅';
    return '🛡️'; // excellent
  };

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 1000,
      padding: '8px 12px',
      borderRadius: '12px',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      color: 'white',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: `1px solid ${getStatusColor(systemStatus.health, systemStatus.security)}`,
      boxShadow: `0 4px 12px rgba(0, 0, 0, 0.2)`
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px' };
      default:
        return { ...baseStyles, top: '20px', right: '20px' };
    }
  };

  if (!showDetails) {
    return (
      <div
        style={getPositionStyles()}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={`System status: ${systemStatus.health}, Security: ${systemStatus.security}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
      >
        <span style={{ marginRight: '6px' }}>
          {getStatusIcon(systemStatus.health, systemStatus.security)}
        </span>
        System {systemStatus.health}
        
        {isExpanded && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '8px',
            padding: '12px',
            background: 'rgba(0, 0, 0, 0.9)',
            borderRadius: '8px',
            minWidth: '200px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Health:</strong> {systemStatus.health}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Security:</strong> {systemStatus.security}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Errors:</strong> {systemStatus.errors}
            </div>
            <div>
              <strong>Uptime:</strong> {formatUptime(systemStatus.uptime)}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={getPositionStyles()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{getStatusIcon(systemStatus.health, systemStatus.security)}</span>
        <div>
          <div>Health: {systemStatus.health}</div>
          <div>Security: {systemStatus.security}</div>
          <div>Errors: {systemStatus.errors}</div>
          <div>Uptime: {formatUptime(systemStatus.uptime)}</div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusIndicator;