/**
 * Rate Limiting Utility
 * Simple in-memory rate limiting for API endpoints
 */

interface RateLimiterOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max number of unique identifiers
}

interface TokenBucket {
  count: number;
  lastReset: number;
}

export function rateLimit(options: RateLimiterOptions) {
  const tokenCache = new Map<string, TokenBucket>();

  return {
    check: async (limit: number, token: string): Promise<{ success: boolean }> => {
      const now = Date.now();
      
      // Clean up old entries
      if (tokenCache.size > options.uniqueTokenPerInterval) {
        const cutoff = now - options.interval;
        for (const [key, bucket] of tokenCache.entries()) {
          if (bucket.lastReset < cutoff) {
            tokenCache.delete(key);
          }
        }
      }
      
      // Get or create bucket for this token
      let bucket = tokenCache.get(token);
      if (!bucket) {
        bucket = { count: 0, lastReset: now };
        tokenCache.set(token, bucket);
      }
      
      // Reset bucket if interval has passed
      if (now - bucket.lastReset > options.interval) {
        bucket.count = 0;
        bucket.lastReset = now;
      }
      
      // Check if limit exceeded
      if (bucket.count >= limit) {
        return { success: false };
      }
      
      // Increment counter
      bucket.count++;
      return { success: true };
    }
  };
}