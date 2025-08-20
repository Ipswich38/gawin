import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { EmailIcon, LockIcon, EyeIcon, EyeOffIcon } from '../ui/Icons';
import { useAuth } from '../../contexts/AuthContext';
import { isValidEmail } from '../ui/utils';

interface LoginPageProps {
  onSwitchToSignUp: () => void;
  onSuccess?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignUp, onSuccess }) => {
  const { signIn, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.success) {
        onSuccess?.();
      } else {
        setErrors({ general: result.error || 'Sign in failed' });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)',
      }}
    >
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <CardHeader>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div 
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B35, #E55A2B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                color: 'white',
                fontSize: '24px',
              }}
            >
              🧠
            </div>
          </div>
          <CardTitle style={{ textAlign: 'center', fontSize: '24px', marginBottom: '8px' }}>
            Welcome Back
          </CardTitle>
          <CardDescription style={{ textAlign: 'center' }}>
            Sign in to your KreativLoops AI account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {errors.general && (
                <div 
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#EF4444',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}
                >
                  {errors.general}
                </div>
              )}

              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                leftIcon={<EmailIcon size={18} />}
                disabled={isSubmitting || isLoading}
                autoComplete="email"
                autoFocus
                required
              />

              <div style={{ position: 'relative' }}>
                <Input
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  error={errors.password}
                  leftIcon={<LockIcon size={18} />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  }
                  disabled={isSubmitting || isLoading}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6B7280', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#FF6B35',
                    }}
                  />
                  Remember me
                </label>

                <a 
                  href="/forgot-password"
                  style={{ 
                    fontSize: '14px', 
                    color: '#FF6B35', 
                    textDecoration: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Forgot password?
                </a>
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter style={{ flexDirection: 'column', gap: '16px' }}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            style={{ width: '100%' }}
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            isLoading={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div style={{ width: '100%', position: 'relative', textAlign: 'center' }}>
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                background: '#E5E7EB',
              }}
            />
            <span 
              style={{
                background: 'white',
                padding: '0 16px',
                fontSize: '14px',
                color: '#6B7280',
                position: 'relative',
                zIndex: 1,
              }}
            >
              or
            </span>
          </div>

          <Button
            variant="secondary"
            size="lg"
            style={{ width: '100%' }}
            onClick={() => {
              // Demo account functionality
              setFormData({ email: 'demo@kreativloops.ai', password: 'demo123' });
              handleInputChange('email', 'demo@kreativloops.ai');
              handleInputChange('password', 'demo123');
            }}
            disabled={isSubmitting || isLoading}
          >
            Try Demo Account
          </Button>

          <div style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignUp}
              style={{
                background: 'none',
                border: 'none',
                color: '#FF6B35',
                textDecoration: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}
              onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Sign up here
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;