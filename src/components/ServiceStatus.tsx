import React, { useState, useEffect } from 'react';
import { perplexityService } from '../services/perplexityService';

interface ServiceStatusProps {
  onClose: () => void;
}

const ServiceStatus: React.FC<ServiceStatusProps> = ({ onClose }) => {
  const [status, setStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [message, setMessage] = useState('Checking service status...');
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      // Check if API key is configured
      const configured = perplexityService.isConfigured();
      setApiKeyConfigured(configured);

      if (!configured) {
        setStatus('error');
        setMessage('Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env file.');
        return;
      }

      // Test the service
      const serviceStatus = await perplexityService.getStatus();
      setStatus(serviceStatus.status);
      setMessage(serviceStatus.message);
    } catch (error) {
      setStatus('error');
      setMessage(`Service check failed: ${error}`);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'ready': return '#4ade80';
      case 'error': return '#f87171';
      default: return '#fbbf24';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'ready': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(24px)',
        borderRadius: '20px',
        padding: '24px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(42, 43, 38, 0.15), 0 8px 32px rgba(42, 43, 38, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        WebkitBackdropFilter: 'blur(24px)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.9)',
          }}>
            Service Status
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              fontSize: '16px',
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}>
          <span style={{ fontSize: '20px', marginRight: '12px' }}>
            {getStatusIcon()}
          </span>
          <div>
            <div style={{
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '4px',
              fontSize: '14px',
            }}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px' }}>
              {message}
            </div>
          </div>
        </div>

        <div style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500' }}>Configuration</h3>
          <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
            <div style={{ marginBottom: '4px' }}>• API Key: {apiKeyConfigured ? '✅ Configured' : '❌ Missing'}</div>
            <div style={{ marginBottom: '4px' }}>• Search Service: ✅ Enabled</div>
            <div style={{ marginBottom: '4px' }}>• Web Scraping: ✅ Ready</div>
            <div>• Citation System: ✅ Active</div>
          </div>
        </div>

        {!apiKeyConfigured && (
          <div style={{
            padding: '16px',
            background: 'rgba(255, 107, 53, 0.1)',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 107, 53, 0.2)',
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: 'rgba(255, 107, 53, 0.9)', fontSize: '14px', fontWeight: '500' }}>Setup Required</h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
              To enable web search, please:
            </p>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
              <li>Get a free API key from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255, 107, 53, 0.8)' }}>console.groq.com</a></li>
              <li>Add it to your .env file: <code style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '2px 4px', borderRadius: '4px', fontSize: '12px' }}>VITE_GROQ_API_KEY=your_key_here</code></li>
              <li>Restart the development server</li>
            </ol>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={checkServiceStatus}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.8), rgba(255, 107, 53, 0.6))',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              fontWeight: '500',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 107, 53, 0.25)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🔄 Recheck
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              fontWeight: '500',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceStatus;