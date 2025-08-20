import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { UserIcon, EmailIcon, LockIcon, EyeIcon, EyeOffIcon } from '../ui/Icons';
import { useAuth } from '../../contexts/AuthContext';
import { isValidEmail } from '../ui/utils';

interface SignUpPageProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSwitchToLogin, onSuccess }) => {
  const { signUp, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const result = await signUp(formData.email, formData.password, formData.fullName);
      
      if (result.success) {
        onSuccess?.();
      } else {
        setErrors({ general: result.error || 'Sign up failed' });
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
      <Card style={{ width: '100%', maxWidth: '420px' }}>
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
            Join KreativLoops AI
          </CardTitle>
          <CardDescription style={{ textAlign: 'center' }}>
            Create your account to get started with intelligent AI assistance
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
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                error={errors.fullName}
                leftIcon={<UserIcon size={18} />}
                disabled={isSubmitting || isLoading}
                autoComplete="name"
                required
              />

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
                required
              />

              <Input
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Create a strong password"
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
                autoComplete="new-password"
                required
              />

              <Input
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                leftIcon={<LockIcon size={18} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                }
                disabled={isSubmitting || isLoading}
                autoComplete="new-password"
                required
              />

              <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.4' }}>
                By creating an account, you agree to our{' '}
                <a 
                  href="/terms" 
                  style={{ color: '#FF6B35', textDecoration: 'none' }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Terms of Service
                </a>
                {' '}and{' '}
                <a 
                  href="/privacy" 
                  style={{ color: '#FF6B35', textDecoration: 'none' }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Privacy Policy
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
            {isSubmitting || isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
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
              Sign in here
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUpPage;