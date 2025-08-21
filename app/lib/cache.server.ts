/**
 * Simple In-Memory Cache
 *
 * Basic caching implementation for server-side data that doesn't change frequently.
 * Particularly useful for dashboard statistics that are expensive to compute.
 *
 * @module CacheServer
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Set a cache entry with TTL (time to live) in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number = 300000): void {
    // default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  /**
   * Get a cache entry if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Entry has expired
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Delete a specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Get or set pattern - fetch data if not in cache
   */
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlMs: number = 300000): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttlMs);
    return data;
  }
}

// Export a singleton instance
export const cache = new SimpleCache();

// Cache keys for common dashboard data
export const CACHE_KEYS = {
  DASHBOARD_STATS: "dashboard_stats",
  TOTAL_OUTSTANDING: "total_outstanding",
  LOANS_BY_YEAR: "loans_by_year",
  PEOPLE_WITH_LOST_ITEMS: "people_with_lost_items",
  INVENTORY_BY_TYPE: "inventory_by_type",
  // Items dashboard cache keys
  ITEMS_BY_TYPE: "items_by_type",
  ITEM_STATUS_COUNT: "item_status_count",
  TOTAL_ITEMS: "total_items",
  OUTSTANDING_ITEMS_COUNT: "outstanding_items_count",
  // Loans dashboard cache keys
  LOANS_BY_MONTH: "loans_by_month",
  LOANS_STATS: "loans_stats",
  // People dashboard cache keys
  PEOPLE_ROLE_COUNT: "people_role_count",
  PEOPLE_OUTSTANDING_LOANS: "people_outstanding_loans",
  TOTAL_PEOPLE: "total_people",
} as const;

// Cache key groups for bulk invalidation
export const CACHE_GROUPS = {
  LOANS: [
    CACHE_KEYS.TOTAL_OUTSTANDING,
    CACHE_KEYS.LOANS_BY_YEAR,
    CACHE_KEYS.LOANS_BY_MONTH,
    CACHE_KEYS.LOANS_STATS,
  ],
  PEOPLE: [
    CACHE_KEYS.PEOPLE_WITH_LOST_ITEMS,
    CACHE_KEYS.PEOPLE_ROLE_COUNT,
    CACHE_KEYS.PEOPLE_OUTSTANDING_LOANS,
    CACHE_KEYS.TOTAL_PEOPLE,
  ],
  INVENTORY: [
    CACHE_KEYS.INVENTORY_BY_TYPE,
    CACHE_KEYS.ITEMS_BY_TYPE,
    CACHE_KEYS.ITEM_STATUS_COUNT,
    CACHE_KEYS.TOTAL_ITEMS,
    CACHE_KEYS.OUTSTANDING_ITEMS_COUNT,
  ],
  DASHBOARD: [
    CACHE_KEYS.TOTAL_OUTSTANDING,
    CACHE_KEYS.LOANS_BY_YEAR,
    CACHE_KEYS.PEOPLE_WITH_LOST_ITEMS,
    CACHE_KEYS.INVENTORY_BY_TYPE,
    CACHE_KEYS.ITEMS_BY_TYPE,
    CACHE_KEYS.ITEM_STATUS_COUNT,
    CACHE_KEYS.TOTAL_ITEMS,
    CACHE_KEYS.OUTSTANDING_ITEMS_COUNT,
    CACHE_KEYS.LOANS_BY_MONTH,
    CACHE_KEYS.LOANS_STATS,
    CACHE_KEYS.PEOPLE_ROLE_COUNT,
    CACHE_KEYS.PEOPLE_OUTSTANDING_LOANS,
    CACHE_KEYS.TOTAL_PEOPLE,
  ],
} as const;

/**
 * Invalidate multiple cache keys at once
 */
export const invalidateCacheGroup = (group: keyof typeof CACHE_GROUPS): void => {
  const keys = CACHE_GROUPS[group];
  keys.forEach((key) => cache.delete(key));
};

// Cleanup expired entries every 10 minutes
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000);
