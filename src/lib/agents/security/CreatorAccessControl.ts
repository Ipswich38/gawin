// Creator-Only Access Control for AI Agent Platform

export class CreatorAccessControl {
  private static instance: CreatorAccessControl;
  private readonly CREATOR_EMAIL = 'kreativloops@gmail.com';
  private readonly SECRET_ACTIVATION_KEY = 'GAWIN_AGENT_PLATFORM_2024';

  private constructor() {
    console.log('🔐 Creator Access Control initialized');
  }

  public static getInstance(): CreatorAccessControl {
    if (!CreatorAccessControl.instance) {
      CreatorAccessControl.instance = new CreatorAccessControl();
    }
    return CreatorAccessControl.instance;
  }

  public isCreatorAuthenticated(): boolean {
    try {
      const storedUser = localStorage.getItem('gawin_user');
      if (!storedUser) return false;

      const user = JSON.parse(storedUser);

      // Strict creator verification
      return (
        user.email === this.CREATOR_EMAIL &&
        user.isCreator === true &&
        user.id === 'creator-001'
      );
    } catch (error) {
      console.error('❌ Creator authentication error:', error);
      return false;
    }
  }

  public hasAgentPlatformAccess(): boolean {
    if (!this.isCreatorAuthenticated()) {
      console.log('❌ Agent platform access denied - not creator');
      return false;
    }

    // Additional security layer - check for activation
    const activationStatus = localStorage.getItem('agent_platform_activated');
    return activationStatus === 'true';
  }

  public activateAgentPlatform(activationKey: string): boolean {
    if (!this.isCreatorAuthenticated()) {
      console.log('❌ Platform activation failed - not creator');
      return false;
    }

    if (activationKey !== this.SECRET_ACTIVATION_KEY) {
      console.log('❌ Platform activation failed - invalid key');
      return false;
    }

    localStorage.setItem('agent_platform_activated', 'true');
    localStorage.setItem('agent_platform_activated_at', Date.now().toString());

    console.log('✅ AI Agent Platform activated for creator');
    return true;
  }

  public deactivateAgentPlatform(): void {
    localStorage.removeItem('agent_platform_activated');
    localStorage.removeItem('agent_platform_activated_at');
    console.log('🔒 AI Agent Platform deactivated');
  }

  public getCreatorProfile(): any {
    if (!this.isCreatorAuthenticated()) return null;

    const storedUser = localStorage.getItem('gawin_user');
    const user = JSON.parse(storedUser!);

    return {
      id: user.id,
      email: user.email,
      name: user.full_name,
      role: 'Creator & CEO',
      company: 'Kreativ Loops Digital Agency',
      platformAccess: this.hasAgentPlatformAccess(),
      activatedAt: localStorage.getItem('agent_platform_activated_at'),
      permissions: [
        'agent_management',
        'business_intelligence',
        'client_data_access',
        'financial_reports',
        'system_configuration',
        'agent_collaboration',
        'performance_analytics'
      ]
    };
  }

  public logSecurityEvent(event: string, details?: any): void {
    const securityLog = {
      timestamp: Date.now(),
      event,
      details,
      userAgent: navigator.userAgent,
      creatorEmail: this.CREATOR_EMAIL
    };

    // Store security logs (in production, send to secure logging service)
    const existingLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    existingLogs.push(securityLog);

    // Keep only last 100 logs
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }

    localStorage.setItem('security_logs', JSON.stringify(existingLogs));
    console.log('🛡️ Security event logged:', event);
  }

  public getSecurityLogs(): any[] {
    if (!this.isCreatorAuthenticated()) return [];
    return JSON.parse(localStorage.getItem('security_logs') || '[]');
  }

  // Secure session management
  public validateSession(): boolean {
    if (!this.hasAgentPlatformAccess()) return false;

    const lastActivity = localStorage.getItem('last_agent_activity');
    const now = Date.now();
    const sessionTimeout = 8 * 60 * 60 * 1000; // 8 hours

    if (lastActivity && (now - parseInt(lastActivity)) > sessionTimeout) {
      this.logSecurityEvent('session_timeout', { lastActivity, timeout: sessionTimeout });
      this.deactivateAgentPlatform();
      return false;
    }

    // Update last activity
    localStorage.setItem('last_agent_activity', now.toString());
    return true;
  }

  public requireCreatorAccess(): void {
    if (!this.hasAgentPlatformAccess()) {
      this.logSecurityEvent('unauthorized_access_attempt', {
        timestamp: Date.now(),
        url: window.location.href
      });
      throw new Error('Unauthorized: Creator access required for AI Agent Platform');
    }
  }

  // Emergency lockdown
  public emergencyLockdown(reason: string): void {
    this.deactivateAgentPlatform();
    localStorage.setItem('emergency_lockdown', 'true');
    localStorage.setItem('lockdown_reason', reason);
    localStorage.setItem('lockdown_timestamp', Date.now().toString());

    this.logSecurityEvent('emergency_lockdown', { reason });
    console.log('🚨 EMERGENCY LOCKDOWN ACTIVATED:', reason);
  }

  public isInLockdown(): boolean {
    return localStorage.getItem('emergency_lockdown') === 'true';
  }

  public clearLockdown(authCode: string): boolean {
    if (authCode !== 'CREATOR_OVERRIDE_2024' || !this.isCreatorAuthenticated()) {
      return false;
    }

    localStorage.removeItem('emergency_lockdown');
    localStorage.removeItem('lockdown_reason');
    localStorage.removeItem('lockdown_timestamp');

    this.logSecurityEvent('lockdown_cleared', { authCode: 'VALID' });
    console.log('✅ Emergency lockdown cleared');
    return true;
  }
}