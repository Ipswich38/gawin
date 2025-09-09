/**
 * Production-Grade API Gateway
 * Handles authentication, rate limiting, request validation, and routing
 * Integrates with the AI Orchestrator architecture
 */

import express, { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { EventBus } from '../events/EventBus';

// Types
interface AuthContext {
  userId: string;
  sessionId: string;
  permissions: string[];
  consentFlags: {
    dataCollection: boolean;
    modelTraining: boolean;
    analytics: boolean;
    mentalHealthFeatures: boolean;
  };
  riskLevel: 'low' | 'medium' | 'high';
}

interface GatewayRequest extends Request {
  auth?: AuthContext;
  requestId?: string;
  startTime?: number;
}

// Validation schemas
const QueryRequestSchema = z.object({
  text: z.string().min(1).max(10000),
  context: z.record(z.any()).optional(),
  model_preference: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(1).max(4000).optional(),
  consent_to_train: z.boolean().optional(),
  priority: z.enum(['low', 'normal', 'high', 'critical']).optional()
});

const AuthRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  remember_me: z.boolean().optional()
});

export class ApiGateway {
  private app: express.Application;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.app = express();
    this.eventBus = eventBus;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    // Security headers
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://gawin.app', 'https://www.gawin.app']
        : ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-Session-ID', 'X-Request-ID']
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request ID and timing
    this.app.use(this.requestIdMiddleware);
    this.app.use(this.timingMiddleware);

    // Rate limiting
    this.app.use('/api/', this.createRateLimit());
  }

  private requestIdMiddleware = (req: GatewayRequest, res: Response, next: NextFunction) => {
    req.requestId = req.get('X-Request-ID') || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    res.setHeader('X-Request-ID', req.requestId);
    next();
  };

  private timingMiddleware = (req: GatewayRequest, res: Response, next: NextFunction) => {
    req.startTime = Date.now();
    
    // Log request completion
    res.on('finish', () => {
      const duration = Date.now() - (req.startTime || 0);
      
      this.eventBus.emit('request.completed', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        userId: req.auth?.userId,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      logger.info('Request completed', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        userId: req.auth?.userId
      });
    });
    
    next();
  };

  private createRateLimit() {
    return rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
      max: (req: GatewayRequest) => {
        if (req.auth?.permissions?.includes('premium')) {
          return parseInt(process.env.RATE_LIMIT_MAX_REQUESTS_PREMIUM || '500');
        }
        return parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
      },
      message: {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later'
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: GatewayRequest) => {
        return req.auth?.userId || req.ip;
      },
      skip: (req: GatewayRequest) => {
        // Skip rate limiting for health checks
        return req.originalUrl === '/health';
      }
    });
  }

  private authMiddleware = async (req: GatewayRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.get('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'Authentication token required'
          }
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Load full auth context (you might want to cache this)
      req.auth = {
        userId: decoded.userId,
        sessionId: decoded.sessionId,
        permissions: decoded.permissions || [],
        consentFlags: decoded.consentFlags || {
          dataCollection: false,
          modelTraining: false,
          analytics: false,
          mentalHealthFeatures: false
        },
        riskLevel: decoded.riskLevel || 'low'
      };

      next();
    } catch (error) {
      logger.warn('Authentication failed', { error: error.message, requestId: req.requestId });
      
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
    }
  };

  private validationMiddleware = (schema: z.ZodSchema) => {
    return (req: GatewayRequest, res: Response, next: NextFunction) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request data',
              details: error.errors
            }
          });
        }
        next(error);
      }
    };
  };

  private setupRoutes() {
    // Health check (no auth required)
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        }
      });
    });

    // Authentication endpoints
    this.app.post('/api/v1/auth/login', 
      this.validationMiddleware(AuthRequestSchema),
      this.handleLogin
    );

    this.app.post('/api/v1/auth/refresh', 
      this.authMiddleware,
      this.handleRefresh
    );

    this.app.post('/api/v1/auth/logout', 
      this.authMiddleware,
      this.handleLogout
    );

    // AI Query endpoint (requires auth)
    this.app.post('/api/v1/query',
      this.authMiddleware,
      this.validationMiddleware(QueryRequestSchema),
      this.handleQuery
    );

    // User profile endpoint
    this.app.get('/api/v1/user/profile',
      this.authMiddleware,
      this.handleGetProfile
    );

    this.app.put('/api/v1/user/profile',
      this.authMiddleware,
      this.handleUpdateProfile
    );

    // Analytics endpoint
    this.app.get('/api/v1/analytics',
      this.authMiddleware,
      this.handleGetAnalytics
    );

    // Mental health specific endpoints
    this.app.post('/api/v1/mental-health/assess',
      this.authMiddleware,
      this.checkMentalHealthConsent,
      this.handleMentalHealthAssessment
    );

    // Error handling
    this.app.use(this.errorHandler);

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Endpoint not found'
        }
      });
    });
  }

  private checkMentalHealthConsent = (req: GatewayRequest, res: Response, next: NextFunction) => {
    if (!req.auth?.consentFlags.mentalHealthFeatures) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'MENTAL_HEALTH_CONSENT_REQUIRED',
          message: 'Mental health features require explicit consent'
        }
      });
    }
    next();
  };

  private handleLogin = async (req: GatewayRequest, res: Response) => {
    // Implementation would integrate with your auth service
    // This is a placeholder
    res.json({
      success: true,
      data: {
        token: 'placeholder-jwt-token',
        user: {
          id: 'user-123',
          email: req.body.email
        }
      }
    });
  };

  private handleRefresh = async (req: GatewayRequest, res: Response) => {
    // Implement token refresh logic
    res.json({ success: true, data: { token: 'new-token' } });
  };

  private handleLogout = async (req: GatewayRequest, res: Response) => {
    // Implement logout logic (blacklist token, etc.)
    res.json({ success: true });
  };

  private handleQuery = async (req: GatewayRequest, res: Response) => {
    try {
      // This would integrate with your Orchestrator
      const { OrchestatorService } = await import('../orchestrator/OrchestratorService');
      const orchestrator = new OrchestatorService();
      
      const result = await orchestrator.processQuery({
        query: req.body.text,
        context: req.body.context || {},
        authContext: req.auth!,
        requestId: req.requestId!,
        preferences: {
          model: req.body.model_preference,
          temperature: req.body.temperature,
          maxTokens: req.body.max_tokens,
          priority: req.body.priority || 'normal'
        },
        consentToTrain: req.body.consent_to_train || false
      });

      res.json({
        success: true,
        data: result,
        metadata: {
          requestId: req.requestId,
          processingTime: Date.now() - (req.startTime || 0)
        }
      });

    } catch (error) {
      logger.error('Query processing error', { 
        error: error.message, 
        requestId: req.requestId,
        userId: req.auth?.userId 
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'QUERY_PROCESSING_ERROR',
          message: 'Failed to process query'
        }
      });
    }
  };

  private handleGetProfile = async (req: GatewayRequest, res: Response) => {
    // Implement profile retrieval
    res.json({ success: true, data: { userId: req.auth?.userId } });
  };

  private handleUpdateProfile = async (req: GatewayRequest, res: Response) => {
    // Implement profile update
    res.json({ success: true });
  };

  private handleGetAnalytics = async (req: GatewayRequest, res: Response) => {
    // Implement analytics retrieval
    res.json({ success: true, data: {} });
  };

  private handleMentalHealthAssessment = async (req: GatewayRequest, res: Response) => {
    // Implement mental health assessment with safety checks
    res.json({ success: true, data: { assessment: 'placeholder' } });
  };

  private errorHandler = (error: Error, req: GatewayRequest, res: Response, next: NextFunction) => {
    logger.error('Unhandled error', { 
      error: error.message,
      stack: error.stack,
      requestId: req.requestId,
      userId: req.auth?.userId,
      url: req.originalUrl
    });

    // Don't leak internal errors in production
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal server error'
      : error.message;

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message
      }
    });
  };

  getApp(): express.Application {
    return this.app;
  }
}

export { AuthContext, GatewayRequest };