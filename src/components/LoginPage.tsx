import React, { useState } from 'react';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

interface LoginPageProps {
  onLogin: (role: 'admin' | 'user') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Access codes
  const ADMIN_CODE = 'GAWYN_ADMIN_2024';
  const USER_CODE = 'GAWYN_USER_ACCESS';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (accessCode === ADMIN_CODE) {
      onLogin('admin');
    } else if (accessCode === USER_CODE) {
      onLogin('user');
    } else {
      setError('Invalid access code. Please try again.');
      setAccessCode('');
    }

    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.terminalBlack} 0%, ${colors.terminalGray} 50%, ${colors.terminalLight} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg
    }}>
      <div style={{
        background: `rgba(12, 12, 12, 0.95)`,
        backdropFilter: 'blur(24px)',
        borderRadius: borderRadius.xl,
        padding: spacing.xxl,
        border: `1px solid ${colors.border}`,
        width: '100%',
        maxWidth: '400px',
        boxShadow: `0 25px 80px rgba(0, 0, 0, 0.3)`,
        WebkitBackdropFilter: 'blur(24px)',
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: spacing.xl }}>
          <div style={{
            fontSize: spacing.xxl,
            marginBottom: spacing.md
          }}>🧠</div>
          <h1 style={{
            fontSize: typography.xxxl,
            fontWeight: '700',
            margin: `0 0 ${spacing.sm} 0`,
            background: `linear-gradient(135deg, ${colors.amber} 0%, ${colors.amberDark} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: colors.primaryText,
            fontFamily: typography.system
          }}>
            Gawyn AI System
          </h1>
          <p style={{
            color: colors.secondaryText,
            fontSize: typography.md,
            margin: 0,
            fontFamily: typography.mono
          }}>
            Advanced Reasoning & Analytics Platform
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              Access Code
            </label>
            <input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter your access code"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                fontSize: '16px',
                color: 'white',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid #FF6B35';
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              color: '#FCA5A5',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !accessCode.trim()}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: isLoading || !accessCode.trim() 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              cursor: isLoading || !accessCode.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              if (!isLoading && accessCode.trim()) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 107, 53, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Authenticating...
              </>
            ) : (
              <>
                🔐 Access System
              </>
            )}
          </button>
        </form>

        {/* Access Info */}
        <div style={{
          marginTop: '32px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            margin: '0 0 8px 0',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            Access Levels
          </h4>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', textAlign: 'left' }}>
            <div style={{ marginBottom: '4px' }}>
              🔧 <strong>Admin Access:</strong> Full dashboard, analytics, and system controls
            </div>
            <div>
              👤 <strong>User Access:</strong> Main Gawyn AI application interface
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '24px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          KreativLoops AI © 2024 | Secured by Advanced Authentication
        </div>
      </div>

      {/* CSS for loading animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;