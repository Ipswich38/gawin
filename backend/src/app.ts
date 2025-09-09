/**
 * Main Application Entry Point
 * Orchestrates all services and starts the production-ready AI backend
 */

import express from 'express';
import dotenv from 'dotenv';
import { ApiGateway } from './api/gateway';
import { EventBus } from './events/EventBus';
import { SafetyProcessor } from './safety/SafetyProcessor';
import { FeatureStore } from './features/FeatureStore';
import { VectorDatabase } from './vector/VectorDatabase';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

class GawinAIOrchestrator {
  private app: express.Application;
  private server: any;
  private eventBus: EventBus;
  private apiGateway: ApiGateway;
  private safetyProcessor: SafetyProcessor;
  private featureStore: FeatureStore;
  private vectorDatabase: VectorDatabase;
  
  private readonly port: number;
  private isShuttingDown: boolean = false;

  constructor() {
    this.port = parseInt(process.env.PORT || '3001');
    this.app = express();
    
    this.initializeServices();
    this.setupGracefulShutdown();
  }

  private initializeServices() {
    logger.info('Initializing Gawin AI Orchestrator services...');

    try {
      // Initialize core services
      this.eventBus = EventBus.getInstance();
      this.safetyProcessor = new SafetyProcessor();
      this.featureStore = new FeatureStore();
      this.vectorDatabase = new VectorDatabase();
      
      // Initialize API Gateway with services
      this.apiGateway = new ApiGateway(this.eventBus);
      this.app = this.apiGateway.getApp();

      // Add health check endpoints
      this.setupHealthChecks();
      
      // Add metrics endpoint
      this.setupMetricsEndpoint();

      logger.info('All services initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize services', { error: error.message });
      process.exit(1);
    }
  }

  private setupHealthChecks() {
    // Comprehensive health check
    this.app.get('/health/detailed', async (req, res) => {
      try {
        const health = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          services: {
            eventBus: {
              status: 'healthy',
              metrics: this.eventBus.getMetrics()
            },
            vectorDatabase: {
              status: 'healthy',
              stats: this.vectorDatabase.getStats()
            },
            safetyProcessor: {
              status: 'healthy',
              escalationQueue: this.safetyProcessor.getEscalationQueue().length
            }
          },
          system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
          }
        };

        res.json(health);

      } catch (error) {
        logger.error('Health check failed', { error: error.message });
        
        res.status(500).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error.message
        });
      }
    });

    // Readiness probe
    this.app.get('/health/ready', (req, res) => {
      if (this.isShuttingDown) {
        return res.status(503).json({ status: 'shutting_down' });
      }
      
      res.json({ status: 'ready' });
    });

    // Liveness probe
    this.app.get('/health/live', (req, res) => {
      res.json({ status: 'alive', timestamp: new Date().toISOString() });
    });
  }

  private setupMetricsEndpoint() {
    // Prometheus-compatible metrics endpoint
    this.app.get('/metrics', (req, res) => {
      try {
        const eventMetrics = this.eventBus.getMetrics();
        const vectorStats = this.vectorDatabase.getStats();
        
        // Generate Prometheus format metrics
        const metrics = [
          `# HELP gawin_events_total Total number of events processed`,
          `# TYPE gawin_events_total counter`,
          `gawin_events_total ${eventMetrics.eventsProcessed}`,
          
          `# HELP gawin_events_errors_total Total number of event processing errors`,
          `# TYPE gawin_events_errors_total counter`,
          `gawin_events_errors_total ${eventMetrics.errorCount}`,
          
          `# HELP gawin_vector_documents_total Total number of vector documents`,
          `# TYPE gawin_vector_documents_total gauge`,
          `gawin_vector_documents_total ${vectorStats.totalDocuments}`,
          
          `# HELP gawin_memory_usage_bytes Current memory usage in bytes`,
          `# TYPE gawin_memory_usage_bytes gauge`,
          `gawin_memory_usage_bytes ${process.memoryUsage().heapUsed}`,
          
          `# HELP gawin_uptime_seconds Application uptime in seconds`,
          `# TYPE gawin_uptime_seconds counter`,
          `gawin_uptime_seconds ${process.uptime()}`
        ];

        res.set('Content-Type', 'text/plain');
        res.send(metrics.join('\n'));

      } catch (error) {
        logger.error('Metrics endpoint failed', { error: error.message });
        res.status(500).send('Metrics unavailable');
      }
    });
  }

  public async start() {
    try {
      this.server = this.app.listen(this.port, () => {
        logger.info(`Gawin AI Orchestrator started successfully`, {
          port: this.port,
          environment: process.env.NODE_ENV || 'development',
          version: process.env.npm_package_version || '1.0.0'
        });

        // Log startup banner
        console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                        🧠 Gawin AI Orchestrator                              ║
║                                                                              ║
║  🚀 Status: RUNNING                                                          ║
║  🌐 Port: ${this.port}                                                             ║
║  🔧 Environment: ${(process.env.NODE_ENV || 'development').toUpperCase().padEnd(11)}                                      ║
║  📊 Health: http://localhost:${this.port}/health                                    ║
║  🎯 API: http://localhost:${this.port}/api/v1                                       ║
║                                                                              ║
║  Features Enabled:                                                           ║
║    ✅ API Gateway with Authentication                                        ║
║    ✅ AI Orchestrator (Query Routing)                                       ║
║    ✅ Safety Processor (Crisis Detection)                                   ║
║    ✅ Feature Store (Real-time Analytics)                                   ║
║    ✅ Vector Database (Semantic Search & RAG)                               ║
║    ✅ Event-Driven Architecture                                             ║
║    ✅ Comprehensive Monitoring                                              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
        `);

        // Emit startup event
        this.eventBus.emitEvent(
          'system.startup.completed',
          {
            port: this.port,
            environment: process.env.NODE_ENV,
            version: process.env.npm_package_version
          },
          'application'
        );
      });

      // Handle server errors
      this.server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          logger.error(`Port ${this.port} is already in use`);
        } else {
          logger.error('Server error', { error: error.message });
        }
        process.exit(1);
      });

    } catch (error) {
      logger.error('Failed to start server', { error: error.message });
      process.exit(1);
    }
  }

  private setupGracefulShutdown() {
    // Handle various shutdown signals
    const shutdownSignals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
    
    shutdownSignals.forEach(signal => {
      process.on(signal, () => {
        logger.info(`Received ${signal}, starting graceful shutdown...`);
        this.gracefulShutdown();
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
      });
      
      this.gracefulShutdown(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection', {
        reason: reason,
        promise: promise
      });
      
      this.gracefulShutdown(1);
    });
  }

  private async gracefulShutdown(exitCode: number = 0) {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress, forcing exit');
      process.exit(exitCode);
    }

    this.isShuttingDown = true;
    
    logger.info('Starting graceful shutdown process...');

    try {
      // Stop accepting new requests
      if (this.server) {
        this.server.close();
        logger.info('HTTP server closed');
      }

      // Shutdown services in reverse order of dependency
      if (this.eventBus) {
        await this.eventBus.shutdown();
        logger.info('Event bus shutdown complete');
      }

      // Give remaining operations time to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      logger.info('Graceful shutdown completed successfully');
      
    } catch (error) {
      logger.error('Error during graceful shutdown', { error: error.message });
      exitCode = 1;
    }

    process.exit(exitCode);
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Start the application if this file is run directly
if (require.main === module) {
  const orchestrator = new GawinAIOrchestrator();
  orchestrator.start();
}

export { GawinAIOrchestrator };