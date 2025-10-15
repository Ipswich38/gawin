import { NextRequest } from 'next/server';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

// Enhanced Security Types
export interface SecurityContext {
  userId: string;
  organizationId?: string;
  permissions: string[];
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  mfaVerified: boolean;
  lastActivity: Date;
  riskScore: number;
}

export interface AuditEvent {
  id: string;
  userId: string;
  organizationId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface MFAChallenge {
  challengeId: string;
  userId: string;
  method: 'totp' | 'sms' | 'email' | 'hardware_key';
  code?: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

// Enterprise Authentication & Authorization System
export class EnterpriseAuth {
  private static instance: EnterpriseAuth;
  private activeSessions: Map<string, SecurityContext> = new Map();
  private mfaChallenges: Map<string, MFAChallenge> = new Map();
  private auditEvents: AuditEvent[] = [];

  static getInstance(): EnterpriseAuth {
    if (!EnterpriseAuth.instance) {
      EnterpriseAuth.instance = new EnterpriseAuth();
    }
    return EnterpriseAuth.instance;
  }

  // Enhanced JWT Token Management
  generateSecureToken(payload: {
    userId: string;
    organizationId?: string;
    permissions: string[];
    sessionId: string;
  }): string {
    const secret = process.env.JWT_SECRET!;
    const now = Math.floor(Date.now() / 1000);

    return sign({
      ...payload,
      iat: now,
      exp: now + (24 * 60 * 60), // 24 hours
      iss: 'gawin-platform',
      aud: 'gawin-users',
      jti: randomBytes(16).toString('hex') // Unique token ID
    }, secret, {
      algorithm: 'HS256'
    });
  }

  // Verify and validate JWT tokens
  async verifyToken(token: string): Promise<SecurityContext | null> {
    try {
      const secret = process.env.JWT_SECRET!;
      const decoded = verify(token, secret) as JwtPayload;

      if (!decoded || typeof decoded === 'string') {
        return null;
      }

      // Check if session is still active
      const session = this.activeSessions.get(decoded.sessionId);
      if (!session) {
        return null;
      }

      // Update last activity
      session.lastActivity = new Date();

      return session;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // Multi-Factor Authentication
  async initiateMFA(
    userId: string,
    method: 'totp' | 'sms' | 'email' | 'hardware_key'
  ): Promise<{ challengeId: string; qrCode?: string }> {
    const challengeId = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const challenge: MFAChallenge = {
      challengeId,
      userId,
      method,
      expiresAt,
      attempts: 0,
      verified: false
    };

    // Generate TOTP secret for new setup
    if (method === 'totp') {
      const secret = randomBytes(20).toString('base32');
      challenge.code = secret;

      // Generate QR code URL for authenticator apps
      const qrCode = `otpauth://totp/Gawin:${userId}?secret=${secret}&issuer=Gawin`;

      this.mfaChallenges.set(challengeId, challenge);
      return { challengeId, qrCode };
    }

    // Send SMS/Email codes
    if (method === 'sms' || method === 'email') {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      challenge.code = await this.hashString(code);

      // Send code via appropriate channel
      await this.sendMFACode(userId, method, code);
    }

    this.mfaChallenges.set(challengeId, challenge);
    return { challengeId };
  }

  async verifyMFA(challengeId: string, code: string): Promise<boolean> {
    const challenge = this.mfaChallenges.get(challengeId);
    if (!challenge) return false;

    if (new Date() > challenge.expiresAt) {
      this.mfaChallenges.delete(challengeId);
      return false;
    }

    challenge.attempts++;

    // Rate limiting for attempts
    if (challenge.attempts > 5) {
      this.mfaChallenges.delete(challengeId);
      await this.logAuditEvent({
        userId: challenge.userId,
        action: 'mfa_brute_force_attempt',
        resource: 'authentication',
        metadata: { challengeId, attempts: challenge.attempts },
        riskLevel: 'high'
      });
      return false;
    }

    let isValid = false;

    if (challenge.method === 'totp') {
      // Verify TOTP code (simplified - use a proper TOTP library)
      isValid = await this.verifyTOTP(challenge.code!, code);
    } else {
      // Verify SMS/Email code
      const hashedCode = await this.hashString(code);
      isValid = timingSafeEqual(
        Buffer.from(challenge.code!),
        Buffer.from(hashedCode)
      );
    }

    if (isValid) {
      challenge.verified = true;
      await this.logAuditEvent({
        userId: challenge.userId,
        action: 'mfa_verified',
        resource: 'authentication',
        metadata: { method: challenge.method },
        riskLevel: 'low'
      });
    }

    return isValid;
  }

  // Role-Based Access Control (RBAC)
  async checkPermission(
    context: SecurityContext,
    resource: string,
    action: string
  ): Promise<boolean> {
    const requiredPermission = `${resource}:${action}`;

    // Check direct permissions
    if (context.permissions.includes(requiredPermission) ||
        context.permissions.includes('*:*')) {
      return true;
    }

    // Check wildcard permissions
    if (context.permissions.includes(`${resource}:*`) ||
        context.permissions.includes(`*:${action}`)) {
      return true;
    }

    // Log unauthorized access attempt
    await this.logAuditEvent({
      userId: context.userId,
      organizationId: context.organizationId,
      action: 'unauthorized_access_attempt',
      resource,
      metadata: { requiredPermission, userPermissions: context.permissions },
      riskLevel: 'medium'
    });

    return false;
  }

  // Advanced Rate Limiting
  createRateLimit(options: {
    windowMs: number;
    max: number;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
  }) {
    return rateLimit({
      windowMs: options.windowMs,
      max: options.max,
      skipSuccessfulRequests: options.skipSuccessfulRequests || false,
      skipFailedRequests: options.skipFailedRequests || false,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          error: 'Too many requests',
          message: 'Please try again later',
          retryAfter: Math.ceil(options.windowMs / 1000)
        });
      }
    });
  }

  // Risk Assessment Engine
  calculateRiskScore(context: {
    ipAddress: string;
    userAgent: string;
    location?: { country: string; city: string };
    deviceFingerprint?: string;
    behaviorPatterns?: any;
  }): number {
    let riskScore = 0;

    // IP reputation check (simplified)
    if (this.isKnownMaliciousIP(context.ipAddress)) {
      riskScore += 50;
    }

    // Unusual location
    if (context.location && this.isUnusualLocation(context.location)) {
      riskScore += 20;
    }

    // Device fingerprint analysis
    if (context.deviceFingerprint && this.isNewDevice(context.deviceFingerprint)) {
      riskScore += 15;
    }

    // Behavior analysis
    if (context.behaviorPatterns && this.hasAnomalousBehavior(context.behaviorPatterns)) {
      riskScore += 25;
    }

    return Math.min(riskScore, 100);
  }

  // Data Encryption & Decryption
  async encryptSensitiveData(data: string): Promise<string> {
    const crypto = await import('crypto');
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('gawin-platform'));

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  async decryptSensitiveData(encryptedData: string): Promise<string> {
    const crypto = await import('crypto');
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);

    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(Buffer.from('gawin-platform'));
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Audit Logging
  async logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp' | 'ipAddress' | 'userAgent'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      id: randomBytes(16).toString('hex'),
      timestamp: new Date(),
      ipAddress: '', // Will be populated from request context
      userAgent: '' // Will be populated from request context
    };

    this.auditEvents.push(auditEvent);

    // In production, save to database
    // await this.saveAuditEvent(auditEvent);

    // Alert on high-risk events
    if (event.riskLevel === 'high' || event.riskLevel === 'critical') {
      await this.sendSecurityAlert(auditEvent);
    }
  }

  // Session Management
  async createSession(
    userId: string,
    request: NextRequest,
    permissions: string[] = []
  ): Promise<string> {
    const sessionId = randomBytes(32).toString('hex');
    const ipAddress = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    const riskScore = this.calculateRiskScore({
      ipAddress,
      userAgent
    });

    const context: SecurityContext = {
      userId,
      permissions,
      sessionId,
      ipAddress,
      userAgent,
      mfaVerified: false,
      lastActivity: new Date(),
      riskScore
    };

    this.activeSessions.set(sessionId, context);

    await this.logAuditEvent({
      userId,
      action: 'session_created',
      resource: 'authentication',
      metadata: { sessionId, riskScore },
      riskLevel: riskScore > 50 ? 'high' : 'low'
    });

    return sessionId;
  }

  async destroySession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      this.activeSessions.delete(sessionId);

      await this.logAuditEvent({
        userId: session.userId,
        action: 'session_destroyed',
        resource: 'authentication',
        metadata: { sessionId },
        riskLevel: 'low'
      });
    }
  }

  // Utility Methods
  private async hashString(input: string): Promise<string> {
    return createHash('sha256')
      .update(input + process.env.HASH_SALT!)
      .digest('hex');
  }

  private async sendMFACode(userId: string, method: string, code: string): Promise<void> {
    // Implementation would send actual SMS/Email
    console.log(`Sending ${method} code ${code} to user ${userId}`);
  }

  private async verifyTOTP(secret: string, code: string): Promise<boolean> {
    // Implementation would use a proper TOTP library like 'otplib'
    return true; // Simplified
  }

  private isKnownMaliciousIP(ip: string): boolean {
    // Implementation would check against threat intelligence feeds
    return false;
  }

  private isUnusualLocation(location: { country: string; city: string }): boolean {
    // Implementation would check against user's historical locations
    return false;
  }

  private isNewDevice(fingerprint: string): boolean {
    // Implementation would check against known device fingerprints
    return false;
  }

  private hasAnomalousBehavior(patterns: any): boolean {
    // Implementation would use ML models to detect anomalies
    return false;
  }

  private getClientIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0] ||
           request.headers.get('x-real-ip') ||
           '127.0.0.1';
  }

  private async sendSecurityAlert(event: AuditEvent): Promise<void> {
    // Implementation would send alerts via email/Slack/PagerDuty
    console.log('Security alert:', event);
  }

  // Compliance & Data Governance
  async generateComplianceReport(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    dataAccess: AuditEvent[];
    dataModifications: AuditEvent[];
    securityIncidents: AuditEvent[];
    userSessions: number;
    mfaAdoption: number;
  }> {
    const orgEvents = this.auditEvents.filter(event =>
      event.organizationId === organizationId &&
      event.timestamp >= startDate &&
      event.timestamp <= endDate
    );

    return {
      dataAccess: orgEvents.filter(e => e.action.includes('read') || e.action.includes('view')),
      dataModifications: orgEvents.filter(e => e.action.includes('create') || e.action.includes('update') || e.action.includes('delete')),
      securityIncidents: orgEvents.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical'),
      userSessions: new Set(orgEvents.filter(e => e.action === 'session_created').map(e => e.userId)).size,
      mfaAdoption: 85 // Simplified calculation
    };
  }
}