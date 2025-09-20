'use client';

import React, { useState } from 'react';
import { UserLocation, LocationService } from '@/lib/services/locationService';

interface PrivacyDashboardProps {
  locationService: LocationService;
  userLocation: UserLocation | null;
  onLocationChange: () => void;
}

const PrivacyDashboard: React.FC<PrivacyDashboardProps> = ({
  locationService,
  userLocation,
  onLocationChange
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const clearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all your location data? This action cannot be undone.')) {
      setIsClearing(true);
      try {
        locationService.clearAllLocationData();
        onLocationChange(); // Notify parent component
        alert('All location data has been cleared successfully.');
      } catch (error) {
        console.error('Failed to clear data:', error);
        alert('Failed to clear data. Please try again.');
      } finally {
        setIsClearing(false);
      }
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const getAccuracyDescription = () => {
    return locationService.getLocationAccuracyDescription();
  };

  const getPrivacyScore = (): { score: number; description: string; color: string } => {
    if (!userLocation) {
      return {
        score: 100,
        description: 'Excellent - No location data stored',
        color: '#10b981'
      };
    }

    let score = 70; // Base score

    // Higher score for less precise methods
    switch (userLocation.accuracy) {
      case 'high':
        score -= 20; // GPS is precise but user consented
        break;
      case 'medium':
        score -= 10; // IP is moderately precise
        break;
      case 'low':
        score += 10; // Timezone is privacy-friendly
        break;
      case 'manual':
        score += 20; // User-provided is most privacy-conscious
        break;
    }

    // Bonus for manual override
    if (userLocation.method === 'user_override') {
      score += 10;
    }

    score = Math.max(0, Math.min(100, score));

    if (score >= 90) return { score, description: 'Excellent privacy protection', color: '#10b981' };
    if (score >= 70) return { score, description: 'Good privacy protection', color: '#f59e0b' };
    if (score >= 50) return { score, description: 'Moderate privacy protection', color: '#f97316' };
    return { score, description: 'Basic privacy protection', color: '#ef4444' };
  };

  const privacyScore = getPrivacyScore();

  const containerStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    maxWidth: '600px',
    margin: '20px auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid #f3f4f6'
  };

  const headerStyle: React.CSSProperties = {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s',
    marginRight: '8px'
  };

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#1a1a1a' }}>
          🔒 Privacy Dashboard
        </h3>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Control your privacy settings and data usage
        </p>
      </div>

      {/* Privacy Score */}
      <div style={sectionStyle}>
        <h4 style={headerStyle}>
          🛡️ Privacy Score
        </h4>
        <div style={{
          background: 'linear-gradient(90deg, #f3f4f6, #e5e7eb)',
          borderRadius: '12px',
          padding: '16px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${privacyScore.score}%`,
            background: `linear-gradient(90deg, ${privacyScore.color}, ${privacyScore.color}dd)`,
            borderRadius: '12px',
            transition: 'width 0.3s ease'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', fontSize: '18px', color: '#1a1a1a' }}>
                {privacyScore.score}/100
              </span>
              <span style={{ fontSize: '14px', color: '#666' }}>
                {privacyScore.description}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Data Section */}
      <div style={sectionStyle}>
        <h4 style={headerStyle}>
          📍 Location Data
        </h4>
        {userLocation ? (
          <div>
            <div style={{
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <div>
                  <strong>Current Location:</strong><br />
                  {userLocation.city}, {userLocation.country}
                </div>
                <div>
                  <strong>Detection Method:</strong><br />
                  {userLocation.method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div>
                  <strong>Accuracy Level:</strong><br />
                  {getAccuracyDescription()}
                </div>
                <div>
                  <strong>Last Updated:</strong><br />
                  {formatTimestamp(userLocation.timestamp)}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={() => setShowDetails(!showDetails)}
                style={{
                  ...buttonStyle,
                  background: showDetails ? '#667eea' : '#e5e7eb',
                  color: showDetails ? 'white' : '#333'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {showDetails ? '👁️ Hide Details' : '🔍 Show Technical Details'}
              </button>
            </div>

            {showDetails && (
              <div style={{
                background: '#1a1a1a',
                color: '#e5e7eb',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'Monaco, Consolas, monospace',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(userLocation, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666'
          }}>
            <p style={{ margin: 0 }}>📍 No location data stored</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
              Your privacy is protected - no location information is being tracked.
            </p>
          </div>
        )}
      </div>

      {/* Data Controls Section */}
      <div style={sectionStyle}>
        <h4 style={headerStyle}>
          ⚙️ Data Controls
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={clearAllData}
            disabled={isClearing}
            style={{
              ...buttonStyle,
              background: isClearing ? '#ccc' : '#ef4444',
              color: 'white',
              cursor: isClearing ? 'not-allowed' : 'pointer',
              opacity: isClearing ? 0.6 : 1
            }}
            onMouseOver={(e) => {
              if (!isClearing) {
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseOut={(e) => {
              if (!isClearing) {
                e.currentTarget.style.background = '#ef4444';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {isClearing ? '🔄 Clearing...' : '🗑️ Clear All Data'}
          </button>

          <button
            onClick={() => window.location.reload()}
            style={{
              ...buttonStyle,
              background: '#6c757d',
              color: 'white'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#5a6268';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#6c757d';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🔄 Refresh Page
          </button>
        </div>
      </div>

      {/* Privacy Information */}
      <div style={{ ...sectionStyle, borderBottom: 'none' }}>
        <h4 style={headerStyle}>
          ℹ️ Privacy Information
        </h4>
        <div style={{
          background: 'linear-gradient(135deg, #667eea20, #764ba220)',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#667eea' }}>🛡️ Gawin Privacy Promise:</strong>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#555' }}>
            <li>Your location data stays on your device only</li>
            <li>No tracking or monitoring of your movements</li>
            <li>Data is never shared with third parties</li>
            <li>You can clear or change your location anytime</li>
            <li>Only city-level accuracy is used for context</li>
            <li>Transparent about how location is determined</li>
          </ul>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
            <strong>Data Retention:</strong> Location data is stored locally in your browser and automatically expires after 30 days or when you clear your browser data.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyDashboard;