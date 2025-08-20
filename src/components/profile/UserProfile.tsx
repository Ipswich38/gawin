import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { UserIcon, EmailIcon, SettingsIcon, ArrowLeftIcon } from '../ui/Icons';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../lib/services/databaseService';

interface UserProfileProps {
  onBack?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onBack }) => {
  const { user, updateProfile, signOut, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });
  const [preferences, setPreferences] = useState(user?.preferences || {
    theme: 'auto',
    language: 'en',
    notifications_enabled: true,
    ai_model_preference: 'gawin-search',
    tutor_mode_default: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});
      setSuccessMessage('');

      if (!formData.full_name.trim()) {
        setErrors({ full_name: 'Full name is required' });
        return;
      }

      const result = await updateProfile({
        full_name: formData.full_name.trim(),
        preferences: {
          theme: preferences.theme as 'light' | 'dark' | 'auto',
          language: preferences.language,
          notifications_enabled: preferences.notifications_enabled,
          ai_model_preference: preferences.ai_model_preference,
          tutor_mode_default: preferences.tutor_mode_default
        },
        updated_at: new Date().toISOString()
      });

      if (result.success) {
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrors({ general: result.error || 'Update failed' });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
    });
    setPreferences(user?.preferences || {
      theme: 'auto',
      language: 'en',
      notifications_enabled: true,
      ai_model_preference: 'gawin-search',
      tutor_mode_default: false
    });
    setIsEditing(false);
    setErrors({});
  };

  const getSubscriptionBadge = (tier: string) => {
    const styles = {
      free: { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' },
      pro: { bg: '#FEF3C7', text: '#D97706', border: '#F59E0B' },
      enterprise: { bg: '#DBEAFE', text: '#1D4ED8', border: '#3B82F6' }
    };
    
    const style = styles[tier as keyof typeof styles] || styles.free;
    
    return (
      <span
        style={{
          padding: '4px 12px',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: style.bg,
          color: style.text,
          border: `1px solid ${style.border}`,
          textTransform: 'capitalize',
        }}
      >
        {tier}
      </span>
    );
  };

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>No user data available</p>
      </div>
    );
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)',
        padding: '20px'
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              leftIcon={<ArrowLeftIcon size={16} />}
            >
              Back
            </Button>
          )}
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
            Account Settings
          </h1>
        </div>

        {successMessage && (
          <div 
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: '#10B981',
              fontSize: '14px',
              marginBottom: '20px'
            }}
          >
            {successMessage}
          </div>
        )}

        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserIcon size={20} />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Manage your account details and preferences
                  </CardDescription>
                </div>
                {getSubscriptionBadge(user.subscription_tier)}
              </div>
            </CardHeader>

            <CardContent>
              {errors.general && (
                <div 
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#EF4444',
                    fontSize: '14px',
                    marginBottom: '20px'
                  }}
                >
                  {errors.general}
                </div>
              )}

              <div style={{ display: 'grid', gap: '20px' }}>
                <Input
                  label="Full Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  leftIcon={<UserIcon size={18} />}
                  disabled={!isEditing || isSubmitting}
                  error={errors.full_name}
                />

                <Input
                  label="Email Address"
                  value={formData.email}
                  leftIcon={<EmailIcon size={18} />}
                  disabled={true}
                  helperText="Email cannot be changed. Contact support if needed."
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                      Credits Remaining
                    </label>
                    <div 
                      style={{
                        padding: '12px 16px',
                        border: '2px solid rgba(255, 107, 53, 0.2)',
                        borderRadius: '12px',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: user.credits_remaining > 20 ? '#10B981' : user.credits_remaining > 5 ? '#F59E0B' : '#EF4444',
                        textAlign: 'center',
                        background: 'rgba(255, 255, 255, 0.95)'
                      }}
                    >
                      {user.credits_remaining}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                      Member Since
                    </label>
                    <div 
                      style={{
                        padding: '12px 16px',
                        border: '2px solid rgba(255, 107, 53, 0.2)',
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#6B7280',
                        textAlign: 'center',
                        background: 'rgba(255, 255, 255, 0.95)'
                      }}
                    >
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              {!isEditing ? (
                <Button
                  variant="primary"
                  onClick={() => setIsEditing(true)}
                  leftIcon={<SettingsIcon size={16} />}
                >
                  Edit Profile
                </Button>
              ) : (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your KreativLoops AI experience
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                    Theme
                  </label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' | 'auto' }))}
                    disabled={!isEditing || isSubmitting}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid rgba(255, 107, 53, 0.2)',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      outline: 'none'
                    }}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                    Default AI Model
                  </label>
                  <select
                    value={preferences.ai_model_preference}
                    onChange={(e) => setPreferences(prev => ({ ...prev, ai_model_preference: e.target.value }))}
                    disabled={!isEditing || isSubmitting}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid rgba(255, 107, 53, 0.2)',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      outline: 'none'
                    }}
                  >
                    <option value="gawin-search">Gawin AI - Advanced Reasoning</option>
                    <option value="llama-3.3-70b-versatile">Llama 3.3 70B</option>
                    <option value="qwen-2.5-coder-32b">Qwen 2.5 Coder</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    id="notifications"
                    checked={preferences.notifications_enabled}
                    onChange={(e) => setPreferences(prev => ({ ...prev, notifications_enabled: e.target.checked }))}
                    disabled={!isEditing || isSubmitting}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#FF6B35',
                    }}
                  />
                  <label htmlFor="notifications" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                    Enable email notifications
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    id="tutorMode"
                    checked={preferences.tutor_mode_default}
                    onChange={(e) => setPreferences(prev => ({ ...prev, tutor_mode_default: e.target.checked }))}
                    disabled={!isEditing || isSubmitting}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#FF6B35',
                    }}
                  />
                  <label htmlFor="tutorMode" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                    Enable Tutor Mode by default
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle style={{ color: '#EF4444' }}>Account Actions</CardTitle>
              <CardDescription>
                Manage your account security and data
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ justifyContent: 'flex-start' }}
                >
                  Change Password
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  style={{ justifyContent: 'flex-start' }}
                >
                  Download My Data
                </Button>

                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px', marginTop: '8px' }}>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to sign out?')) {
                        signOut();
                      }
                    }}
                    disabled={isLoading}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;