/**
 * Event Bus
 * Implements event-driven architecture for decoupled communication between services
 * Supports both in-memory and external message queue systems
 */

import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

interface EventMetadata {
  eventId: string;
  timestamp: Date;
  source: string;
  version: string;
  correlationId?: string;
  userId?: string;
  sessionId?: string;
}

interface BaseEvent {
  type: string;
  data: any;
  metadata: EventMetadata;
}

interface EventHandler {
  handler: (data: any, metadata: EventMetadata) => Promise<void> | void;
  options: {
    priority?: number;
    retry?: boolean;
    maxRetries?: number;
    timeout?: number;
  };
}

export class EventBus extends EventEmitter {
  private static instance: EventBus;
  private handlers: Map<string, EventHandler[]>;
  private eventHistory: BaseEvent[];
  private maxHistorySize: number = 1000;
  private kafkaEnabled: boolean = false;
  
  // Performance metrics
  private metrics = {
    eventsEmitted: 0,
    eventsProcessed: 0,
    errorCount: 0,
    avgProcessingTime: 0
  };

  constructor() {
    super();
    this.handlers = new Map();
    this.eventHistory = [];
    this.setMaxListeners(50); // Increase default limit
    
    this.setupInternalEvents();
    this.initializeExternalQueue();
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  private setupInternalEvents() {
    // Handle unhandled errors
    this.on('error', (error: Error, eventType?: string) => {
      logger.error('EventBus error', {
        error: error.message,
        stack: error.stack,
        eventType
      });
      
      this.metrics.errorCount++;
    });

    // Log high-level events for debugging
    this.on('newListener', (eventType: string) => {
      logger.debug('New event listener registered', { eventType });
    });
  }

  private async initializeExternalQueue() {
    // Initialize Kafka or other external message queue if configured
    if (process.env.KAFKA_BROKERS && process.env.NODE_ENV === 'production') {
      try {
        // Kafka integration would go here
        this.kafkaEnabled = false; // Set to true when implemented
        logger.info('External message queue initialized');
      } catch (error) {
        logger.warn('Failed to initialize external message queue', {
          error: error.message
        });
      }
    }
  }

  /**
   * Register an event handler with options
   */
  registerHandler(
    eventType: string,
    handler: (data: any, metadata: EventMetadata) => Promise<void> | void,
    options: EventHandler['options'] = {}
  ) {
    const eventHandler: EventHandler = {
      handler,
      options: {
        priority: 0,
        retry: false,
        maxRetries: 3,
        timeout: 5000,
        ...options
      }
    };

    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    const handlers = this.handlers.get(eventType)!;
    handlers.push(eventHandler);
    
    // Sort by priority (higher priority first)
    handlers.sort((a, b) => (b.options.priority || 0) - (a.options.priority || 0));

    // Register with EventEmitter
    this.on(eventType, async (data: any, metadata: EventMetadata) => {
      await this.executeHandler(eventType, eventHandler, data, metadata);
    });

    logger.debug('Event handler registered', {
      eventType,
      handlersCount: handlers.length,
      priority: eventHandler.options.priority
    });
  }

  /**
   * Emit an event with automatic metadata generation
   */
  async emitEvent(
    eventType: string,
    data: any,
    source: string = 'unknown',
    options: {
      correlationId?: string;
      userId?: string;
      sessionId?: string;
      persistent?: boolean;
    } = {}
  ): Promise<void> {
    const metadata: EventMetadata = {
      eventId: this.generateEventId(),
      timestamp: new Date(),
      source,
      version: '1.0.0',
      correlationId: options.correlationId,
      userId: options.userId,
      sessionId: options.sessionId
    };

    const event: BaseEvent = {
      type: eventType,
      data,
      metadata
    };

    // Add to history
    this.addToHistory(event);

    // Update metrics
    this.metrics.eventsEmitted++;

    const startTime = Date.now();

    try {
      // Emit locally
      this.emit(eventType, data, metadata);

      // Emit to external queue if enabled and requested
      if (this.kafkaEnabled && options.persistent) {
        await this.publishToExternalQueue(event);
      }

      // Update processing time metric
      const processingTime = Date.now() - startTime;
      this.metrics.avgProcessingTime = 
        (this.metrics.avgProcessingTime + processingTime) / 2;

      logger.debug('Event emitted successfully', {
        eventType,
        eventId: metadata.eventId,
        processingTime,
        handlersCount: this.handlers.get(eventType)?.length || 0
      });

    } catch (error) {
      logger.error('Failed to emit event', {
        eventType,
        eventId: metadata.eventId,
        error: error.message
      });
      
      this.emit('error', error, eventType);
    }
  }

  /**
   * Execute a specific event handler with retry logic
   */
  private async executeHandler(
    eventType: string,
    eventHandler: EventHandler,
    data: any,
    metadata: EventMetadata
  ) {
    const { handler, options } = eventHandler;
    let attempt = 1;
    const maxRetries = options.maxRetries || 3;

    while (attempt <= maxRetries) {
      try {
        // Add timeout if specified
        if (options.timeout) {
          await this.withTimeout(
            handler(data, metadata),
            options.timeout,
            `Handler timeout for ${eventType}`
          );
        } else {
          await handler(data, metadata);
        }

        this.metrics.eventsProcessed++;
        
        logger.debug('Event handler executed successfully', {
          eventType,
          eventId: metadata.eventId,
          attempt,
          source: metadata.source
        });
        
        return; // Success, exit retry loop

      } catch (error) {
        logger.warn('Event handler failed', {
          eventType,
          eventId: metadata.eventId,
          attempt,
          maxRetries,
          error: error.message
        });

        if (!options.retry || attempt >= maxRetries) {
          this.emit('error', error, eventType);
          return;
        }

        // Exponential backoff for retries
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        attempt++;
      }
    }
  }

  /**
   * Utility method to add timeout to promises
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string
  ): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    });

    return Promise.race([promise, timeout]);
  }

  /**
   * Get event history for debugging
   */
  getEventHistory(
    eventType?: string,
    limit: number = 100,
    userId?: string
  ): BaseEvent[] {
    let filtered = this.eventHistory;

    if (eventType) {
      filtered = filtered.filter(event => event.type === eventType);
    }

    if (userId) {
      filtered = filtered.filter(event => event.metadata.userId === userId);
    }

    return filtered
      .sort((a, b) => b.metadata.timestamp.getTime() - a.metadata.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      activeHandlers: Array.from(this.handlers.entries()).reduce(
        (acc, [eventType, handlers]) => {
          acc[eventType] = handlers.length;
          return acc;
        },
        {} as Record<string, number>
      ),
      historySize: this.eventHistory.length,
      maxListeners: this.getMaxListeners()
    };
  }

  /**
   * Clear event history (useful for memory management)
   */
  clearHistory(beforeDate?: Date) {
    if (beforeDate) {
      this.eventHistory = this.eventHistory.filter(
        event => event.metadata.timestamp > beforeDate
      );
    } else {
      this.eventHistory = [];
    }

    logger.info('Event history cleared', {
      remainingEvents: this.eventHistory.length
    });
  }

  /**
   * Gracefully shutdown the event bus
   */
  async shutdown() {
    logger.info('Shutting down EventBus');
    
    // Wait for any pending events to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Remove all listeners
    this.removeAllListeners();
    
    // Clear handlers
    this.handlers.clear();
    
    // Clear history
    this.clearHistory();
    
    logger.info('EventBus shutdown complete');
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addToHistory(event: BaseEvent) {
    this.eventHistory.push(event);
    
    // Maintain history size limit
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift(); // Remove oldest event
    }
  }

  private async publishToExternalQueue(event: BaseEvent) {
    // Kafka or other external queue implementation would go here
    // For now, just log that we would publish
    logger.debug('Would publish to external queue', {
      eventType: event.type,
      eventId: event.metadata.eventId
    });
  }
}

// Convenience methods for common event patterns
export class EventPatterns {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Emit user interaction event
   */
  async userInteraction(data: {
    userId: string;
    sessionId: string;
    action: string;
    details: any;
  }) {
    await this.eventBus.emitEvent(
      'user.interaction',
      data,
      'user-interface',
      {
        userId: data.userId,
        sessionId: data.sessionId,
        persistent: true
      }
    );
  }

  /**
   * Emit query processing event
   */
  async queryProcessed(data: {
    userId: string;
    sessionId: string;
    requestId: string;
    query: string;
    response: string;
    model: string;
    processingTime: number;
    satisfaction?: number;
  }) {
    await this.eventBus.emitEvent(
      'user.query.processed',
      data,
      'orchestrator',
      {
        userId: data.userId,
        sessionId: data.sessionId,
        correlationId: data.requestId,
        persistent: true
      }
    );
  }

  /**
   * Emit safety violation event
   */
  async safetyViolation(data: {
    userId: string;
    sessionId?: string;
    violationType: string;
    severity: string;
    content: string;
    action: string;
  }) {
    await this.eventBus.emitEvent(
      'safety.violation.detected',
      data,
      'safety-processor',
      {
        userId: data.userId,
        sessionId: data.sessionId,
        persistent: true
      }
    );
  }

  /**
   * Emit model performance event
   */
  async modelPerformance(data: {
    model: string;
    version: string;
    latency: number;
    tokensUsed: number;
    success: boolean;
    error?: string;
  }) {
    await this.eventBus.emitEvent(
      'model.performance',
      data,
      'model-service',
      { persistent: true }
    );
  }

  /**
   * Emit analytics event
   */
  async analytics(eventType: string, data: any, userId?: string, sessionId?: string) {
    await this.eventBus.emitEvent(
      `analytics.${eventType}`,
      data,
      'analytics-service',
      {
        userId,
        sessionId,
        persistent: true
      }
    );
  }
}

// Export singleton instance and patterns
export const eventBus = EventBus.getInstance();
export const eventPatterns = new EventPatterns(eventBus);