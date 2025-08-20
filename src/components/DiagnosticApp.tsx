import React, { useState } from 'react';
import LoginPage from './LoginPage';
import AdminDashboard from './AdminDashboard';

const DiagnosticApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (role: 'admin' | 'user') => {
    try {
      setUserRole(role);
      setIsAuthenticated(true);
      setError(null);
      console.log(`Logged in as: ${role}`);
    } catch (err) {
      setError(`Login error: ${err}`);
      console.error('Login error:', err);
    }
  };

  const handleLogout = () => {
    try {
      setIsAuthenticated(false);
      setUserRole(null);
      setError(null);
      console.log('Logged out');
    } catch (err) {
      setError(`Logout error: ${err}`);
      console.error('Logout error:', err);
    }
  };

  // Error display
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#f5f5f5'
      }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '10px',
          border: '2px solid #ff4444',
          maxWidth: '600px'
        }}>
          <h1 style={{ color: '#ff4444', marginBottom: '20px' }}>🚨 Diagnostic Error</h1>
          <p><strong>Error:</strong> {error}</p>
          <button 
            onClick={() => setError(null)}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Clear Error & Retry
          </button>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    console.log('Rendering login page');
    return (
      <div>
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          🔍 Diagnostic Mode: Login Page
        </div>
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }

  // Admin dashboard
  if (userRole === 'admin') {
    console.log('Rendering admin dashboard');
    return (
      <div>
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          🔍 Diagnostic Mode: Admin Dashboard
        </div>
        <AdminDashboard onLogout={handleLogout} />
      </div>
    );
  }

  // User app (simplified version)
  if (userRole === 'user') {
    console.log('Rendering user app');
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          🔍 Diagnostic Mode: User App
        </div>
        
        <div style={{
          background: 'rgba(20, 20, 25, 0.95)',
          backdropFilter: 'blur(24px)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 20px 0',
            background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🧠 Gawyn AI User App
          </h1>
          
          <p style={{ marginBottom: '30px', opacity: 0.8 }}>
            Diagnostic mode - User application loaded successfully!
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>
              ✅ Authentication: Working<br/>
              ✅ Component Rendering: Working<br/>
              ✅ Styling: Working
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            🚪 Logout & Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f0f0'
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        border: '2px solid #ffa500'
      }}>
        <h1>🤔 Unexpected State</h1>
        <p>Authentication: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>User Role: {userRole || 'None'}</p>
        <button onClick={() => window.location.reload()}>🔄 Reload Page</button>
      </div>
    </div>
  );
};

export default DiagnosticApp;