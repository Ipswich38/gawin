'use client';

import React, { useState } from 'react';
import { UserLocation } from '@/lib/services/locationService';

interface LocationStatusBarProps {
  location: UserLocation | null;
  status: 'detecting' | 'loaded' | 'manual' | 'failed' | 'denied';
  onLocationChange: (city: string, region: string, country: string) => void;
  onClearLocation: () => void;
  onRefreshLocation: () => Promise<void>;
}

interface LocationEditorProps {
  currentLocation: UserLocation | null;
  onSave: (city: string, region: string, country: string) => void;
  onCancel: () => void;
}

const LocationEditor: React.FC<LocationEditorProps> = ({ currentLocation, onSave, onCancel }) => {
  const [city, setCity] = useState(currentLocation?.city || '');
  const [region, setRegion] = useState(currentLocation?.region || '');
  const [country, setCountry] = useState(currentLocation?.country || '');

  const handleSave = () => {
    if (city.trim() && country.trim()) {
      onSave(city.trim(), region.trim(), country.trim());
      onCancel();
    }
  };

  const commonCountries = [
    'Philippines', 'United States', 'Canada', 'United Kingdom', 'Australia',
    'Singapore', 'Malaysia', 'Indonesia', 'Thailand', 'Vietnam',
    'Japan', 'South Korea', 'Hong Kong', 'Taiwan', 'India'
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.6)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '16px',
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1a1a1a', textAlign: 'center' }}>
          📍 Set Your Location
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
            City *
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Manila, New York, Singapore..."
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
            State/Region
          </label>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Metro Manila, California, Singapore..."
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
            Country *
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              background: 'white',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          >
            <option value="">Select country...</option>
            {commonCountries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="other">Other (type below)</option>
          </select>

          {country === 'other' && (
            <input
              type="text"
              value=""
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Type your country"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                marginTop: '8px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          )}
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '12px',
          color: '#666'
        }}>
          <strong>Privacy Note:</strong> This location is stored only on your device and helps Gawin provide better local context like weather and cultural references.
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={handleSave}
            disabled={!city.trim() || !country.trim()}
            style={{
              background: city.trim() && country.trim() ?
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: city.trim() && country.trim() ? 'pointer' : 'not-allowed',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => {
              if (city.trim() && country.trim()) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            💾 Save Location
          </button>
          <button
            onClick={onCancel}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const LocationStatusBar: React.FC<LocationStatusBarProps> = ({
  location,
  status,
  onLocationChange,
  onClearLocation,
  onRefreshLocation
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshLocation();
    } catch (error) {
      console.error('Failed to refresh location:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'detecting': return '🔍';
      case 'loaded': return '📍';
      case 'manual': return '📝';
      case 'failed': return '❌';
      case 'denied': return '🚫';
      default: return '📍';
    }
  };

  const getStatusText = () => {
    if (status === 'detecting') {
      return 'Detecting your location for personalized responses...';
    }

    if (!location || !location.city) {
      switch (status) {
        case 'failed':
          return 'Location detection failed';
        case 'denied':
          return 'Location access denied';
        default:
          return 'Location unknown';
      }
    }

    const methodText = {
      'browser_geolocation': 'GPS',
      'ip_geolocation': 'IP',
      'timezone_detection': 'Timezone',
      'user_override': 'Manual',
      'manual': 'Manual',
      'default': 'Default'
    }[location.method] || location.method;

    return `${location.city}, ${location.country} (${methodText})`;
  };

  const locationBarStyle: React.CSSProperties = {
    background: status === 'detecting' ?
      'linear-gradient(90deg, #667eea, #764ba2)' :
      location && location.city ?
        'linear-gradient(90deg, #10b981, #34d399)' :
        'linear-gradient(90deg, #f59e0b, #fbbf24)',
    color: 'white',
    padding: '8px 16px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  };

  const buttonStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background 0.2s'
  };

  return (
    <>
      <div style={locationBarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{getStatusIcon()}</span>
          <span>{getStatusText()}</span>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {location && location.city && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                ...buttonStyle,
                opacity: isRefreshing ? 0.6 : 1,
                cursor: isRefreshing ? 'not-allowed' : 'pointer'
              }}
              onMouseOver={(e) => {
                if (!isRefreshing) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }}
            >
              {isRefreshing ? '🔄' : '🔄'} Refresh
            </button>
          )}

          <button
            onClick={() => setIsEditing(true)}
            style={buttonStyle}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            {location && location.city ? '✏️ Change' : '📍 Set Location'}
          </button>

          {location && location.city && (
            <button
              onClick={onClearLocation}
              style={buttonStyle}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              🗑️ Clear
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <LocationEditor
          currentLocation={location}
          onSave={onLocationChange}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </>
  );
};

export default LocationStatusBar;