import Redis from 'ioredis';

// Performance & Caching Types
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
  version: string;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: number;
  tags: Record<string, string>;
}

export interface CacheStats {
  totalKeys: number;
  totalMemory: number;
  hitRate: number;
  missRate: number;
  evictions: number;
  operations: {
    gets: number;
    sets: number;
    deletes: number;
  };
}

// Advanced Cache Manager with Redis and In-Memory Fallback
export class CacheManager {
  private static instance: CacheManager;
  private redis: Redis | null = null;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private performanceMetrics: PerformanceMetric[] = [];
  private stats: CacheStats = {
    totalKeys: 0,
    totalMemory: 0,
    hitRate: 0,
    missRate: 0,
    evictions: 0,
    operations: { gets: 0, sets: 0, deletes: 0 }
  };

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  constructor() {
    this.initializeRedis();
    this.startMetricsCollection();
  }

  private async initializeRedis(): Promise<void> {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL, {
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
          lazyConnect: true
        });

        this.redis.on('error', (err) => {
          console.warn('Redis connection error, falling back to memory cache:', err);
          this.redis = null;
        });

        this.redis.on('connect', () => {
          console.log('Redis cache connected successfully');
        });

        await this.redis.connect();
      }
    } catch (error) {
      console.warn('Failed to initialize Redis, using memory cache:', error);
      this.redis = null;
    }
  }

  // Smart caching with automatic TTL and compression
  async set<T>(
    key: string,
    data: T,
    options: {
      ttl?: number; // seconds
      compress?: boolean;
      tags?: string[];
      version?: string;
    } = {}
  ): Promise<void> {
    const startTime = Date.now();
    const {
      ttl = 3600, // 1 hour default
      compress = false,
      tags = [],
      version = '1.0'
    } = options;

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl * 1000,
        hits: 0,
        lastAccessed: Date.now(),
        version
      };

      let serializedData = JSON.stringify(entry);

      // Compress large data
      if (compress && serializedData.length > 1024) {
        const { gzip } = await import('zlib');
        const { promisify } = await import('util');
        const gzipAsync = promisify(gzip);

        const compressed = await gzipAsync(Buffer.from(serializedData));
        serializedData = compressed.toString('base64');
      }

      if (this.redis) {
        // Use Redis for distributed caching
        await this.redis.setex(key, ttl, serializedData);

        // Set tags for cache invalidation
        if (tags.length > 0) {
          const pipeline = this.redis.pipeline();
          tags.forEach(tag => {
            pipeline.sadd(`tag:${tag}`, key);
            pipeline.expire(`tag:${tag}`, ttl);
          });
          await pipeline.exec();
        }
      } else {
        // Fallback to memory cache
        this.memoryCache.set(key, entry);

        // Auto cleanup expired entries
        setTimeout(() => {
          this.memoryCache.delete(key);
        }, ttl * 1000);
      }

      this.recordMetric('cache_set_duration', Date.now() - startTime, { key, compressed: compress.toString() });
      this.stats.operations.sets++;
      this.stats.totalKeys++;

    } catch (error) {
      console.error('Cache set error:', error);
      this.recordMetric('cache_error', 1, { operation: 'set', key });
    }
  }

  // Intelligent cache retrieval with automatic decompression
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();

    try {
      let serializedData: string | null = null;
      let entry: CacheEntry<T> | null = null;

      if (this.redis) {
        serializedData = await this.redis.get(key);
        if (serializedData) {
          try {
            // Try to parse as compressed data first
            if (serializedData.includes('H4sI')) { // gzip magic number in base64
              const { gunzip } = await import('zlib');
              const { promisify } = await import('util');
              const gunzipAsync = promisify(gunzip);

              const decompressed = await gunzipAsync(Buffer.from(serializedData, 'base64'));
              entry = JSON.parse(decompressed.toString());
            } else {
              entry = JSON.parse(serializedData);
            }
          } catch (parseError) {
            console.warn('Failed to parse cached data:', parseError);
            await this.delete(key);
            return null;
          }
        }
      } else {
        entry = this.memoryCache.get(key) || null;
      }

      if (!entry) {
        this.recordMetric('cache_miss', 1, { key });
        this.stats.operations.gets++;
        this.stats.missRate = (this.stats.missRate * 0.9) + 0.1;
        return null;
      }

      // Check if entry has expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        await this.delete(key);
        this.recordMetric('cache_expired', 1, { key });
        return null;
      }

      // Update access statistics
      entry.hits++;
      entry.lastAccessed = Date.now();

      this.recordMetric('cache_hit', 1, { key });
      this.recordMetric('cache_get_duration', Date.now() - startTime, { key });
      this.stats.operations.gets++;
      this.stats.hitRate = (this.stats.hitRate * 0.9) + 0.1;

      return entry.data;

    } catch (error) {
      console.error('Cache get error:', error);
      this.recordMetric('cache_error', 1, { operation: 'get', key });
      return null;
    }
  }

  // Multi-get operation for batch retrieval
  async mget<T>(keys: string[]): Promise<Record<string, T | null>> {
    const results: Record<string, T | null> = {};

    if (this.redis) {
      const pipeline = this.redis.pipeline();
      keys.forEach(key => pipeline.get(key));
      const responses = await pipeline.exec();

      for (let i = 0; i < keys.length; i++) {
        const [error, value] = responses![i];
        if (!error && value) {
          try {
            const entry: CacheEntry<T> = JSON.parse(value as string);
            if (Date.now() - entry.timestamp <= entry.ttl) {
              results[keys[i]] = entry.data;
            }
          } catch (parseError) {
            results[keys[i]] = null;
          }
        } else {
          results[keys[i]] = null;
        }
      }
    } else {
      for (const key of keys) {
        results[key] = await this.get<T>(key);
      }
    }

    return results;
  }

  // Cache invalidation by key or tags
  async delete(key: string): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.del(key);
      } else {
        this.memoryCache.delete(key);
      }

      this.stats.operations.deletes++;
      this.stats.totalKeys = Math.max(0, this.stats.totalKeys - 1);

    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // Invalidate cache by tags
  async invalidateByTags(tags: string[]): Promise<void> {
    if (!this.redis) return;

    try {
      for (const tag of tags) {
        const keys = await this.redis.smembers(`tag:${tag}`);
        if (keys.length > 0) {
          const pipeline = this.redis.pipeline();
          keys.forEach(key => pipeline.del(key));
          pipeline.del(`tag:${tag}`);
          await pipeline.exec();
        }
      }
    } catch (error) {
      console.error('Tag invalidation error:', error);
    }
  }

  // Advanced caching patterns
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number;
      compress?: boolean;
      tags?: string[];
      staleWhileRevalidate?: boolean;
    } = {}
  ): Promise<T> {
    const { staleWhileRevalidate = false } = options;

    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If stale-while-revalidate is enabled, return stale data and update in background
    if (staleWhileRevalidate && this.redis) {
      const staleKey = `stale:${key}`;
      const staleData = await this.get<T>(staleKey);
      if (staleData !== null) {
        // Update in background
        fetcher().then(freshData => {
          this.set(key, freshData, options);
          this.set(staleKey, freshData, { ...options, ttl: (options.ttl || 3600) * 2 });
        });
        return staleData;
      }
    }

    // Fetch fresh data
    const freshData = await fetcher();

    // Cache the result
    await this.set(key, freshData, options);

    // Also set stale copy if enabled
    if (staleWhileRevalidate) {
      await this.set(`stale:${key}`, freshData, {
        ...options,
        ttl: (options.ttl || 3600) * 2
      });
    }

    return freshData;
  }

  // Cache warming for critical data
  async warmCache(warmingConfig: {
    keys: string[];
    fetcher: (key: string) => Promise<any>;
    batchSize?: number;
    options?: any;
  }): Promise<void> {
    const { keys, fetcher, batchSize = 10, options = {} } = warmingConfig;

    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      const promises = batch.map(async (key) => {
        try {
          const data = await fetcher(key);
          await this.set(key, data, options);
        } catch (error) {
          console.warn(`Failed to warm cache for key ${key}:`, error);
        }
      });

      await Promise.allSettled(promises);

      // Small delay between batches to prevent overwhelming the system
      if (i + batchSize < keys.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  // Performance monitoring
  private recordMetric(name: string, value: number, tags: Record<string, string> = {}): void {
    const metric: PerformanceMetric = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      value,
      unit: name.includes('duration') ? 'ms' : 'count',
      timestamp: Date.now(),
      tags
    };

    this.performanceMetrics.push(metric);

    // Keep only last 1000 metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }
  }

  private startMetricsCollection(): void {
    setInterval(async () => {
      await this.updateCacheStats();
    }, 30000); // Update every 30 seconds
  }

  private async updateCacheStats(): Promise<void> {
    try {
      if (this.redis) {
        const info = await this.redis.memory('usage');
        this.stats.totalMemory = info || 0;

        const keyCount = await this.redis.dbsize();
        this.stats.totalKeys = keyCount;
      } else {
        this.stats.totalKeys = this.memoryCache.size;
        this.stats.totalMemory = JSON.stringify([...this.memoryCache.entries()]).length;
      }
    } catch (error) {
      console.warn('Failed to update cache stats:', error);
    }
  }

  // Public API for monitoring
  getStats(): CacheStats {
    return { ...this.stats };
  }

  getMetrics(since?: number): PerformanceMetric[] {
    if (since) {
      return this.performanceMetrics.filter(m => m.timestamp >= since);
    }
    return [...this.performanceMetrics];
  }

  // Cache health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      redis: boolean;
      memory: boolean;
      hitRate: number;
      avgResponseTime: number;
    };
  }> {
    const recentMetrics = this.getMetrics(Date.now() - 300000); // Last 5 minutes
    const avgResponseTime = recentMetrics
      .filter(m => m.name === 'cache_get_duration')
      .reduce((sum, m) => sum + m.value, 0) / Math.max(recentMetrics.length, 1);

    const details = {
      redis: !!this.redis,
      memory: this.stats.totalMemory < 1000000000, // Less than 1GB
      hitRate: this.stats.hitRate,
      avgResponseTime
    };

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (!details.redis || details.hitRate < 0.7 || avgResponseTime > 100) {
      status = 'degraded';
    }

    if (!details.memory || details.hitRate < 0.5 || avgResponseTime > 500) {
      status = 'unhealthy';
    }

    return { status, details };
  }

  // Cleanup and maintenance
  async cleanup(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
    this.memoryCache.clear();
    this.performanceMetrics = [];
  }

  // Advanced features for enterprise
  async backup(): Promise<string> {
    if (!this.redis) throw new Error('Backup requires Redis');

    return await this.redis.bgsave();
  }

  async getKeysByPattern(pattern: string): Promise<string[]> {
    if (!this.redis) return [];

    return await this.redis.keys(pattern);
  }

  async getTTL(key: string): Promise<number> {
    if (this.redis) {
      return await this.redis.ttl(key);
    } else {
      const entry = this.memoryCache.get(key);
      if (entry) {
        const remaining = entry.ttl - (Date.now() - entry.timestamp);
        return Math.max(0, Math.floor(remaining / 1000));
      }
      return -1;
    }
  }
}