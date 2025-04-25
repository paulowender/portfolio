// Simple in-memory cache for API responses
type CacheEntry<T> = {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
};

class ApiCache {
  private cache: Record<string, CacheEntry<any>> = {};
  
  // Set data in cache with expiration
  set<T>(key: string, data: T, expiresIn: number = 60000): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      expiresIn,
    };
  }
  
  // Get data from cache if not expired
  get<T>(key: string): T | null {
    const entry = this.cache[key];
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() > entry.timestamp + entry.expiresIn) {
      // Remove expired entry
      delete this.cache[key];
      return null;
    }
    
    return entry.data as T;
  }
  
  // Check if key exists and is not expired
  has(key: string): boolean {
    const entry = this.cache[key];
    
    if (!entry) {
      return false;
    }
    
    // Check if entry has expired
    if (Date.now() > entry.timestamp + entry.expiresIn) {
      // Remove expired entry
      delete this.cache[key];
      return false;
    }
    
    return true;
  }
  
  // Remove a specific key from cache
  remove(key: string): void {
    delete this.cache[key];
  }
  
  // Clear all cache
  clear(): void {
    this.cache = {};
  }
}

// Create a singleton instance
export const apiCache = new ApiCache();
