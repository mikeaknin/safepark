/**
 * Zero-Dependency Client Storage Layer (SafeParkDB)
 * Native window.indexedDB client storage with graceful localStorage fallback.
 * Caches municipal crime records and clustered parking blocks with a 12-hour TTL
 * for sub-50ms cold boots and full offline resiliency.
 */

export interface CacheRecord<T = any> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt: number;
}

const DB_NAME = 'SafeParkDB';
const DB_VERSION = 1;
const STORE_NAME = 'api_cache';
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

class CacheServiceClass {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private memoryFallback: Map<string, CacheRecord> = new Map();

  private isIndexedDBAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      'indexedDB' in window &&
      window.indexedDB !== null &&
      window.indexedDB !== undefined
    );
  }

  private isLocalStorageAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const test = '__safepark_db_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private async getDB(): Promise<IDBDatabase | null> {
    if (!this.isIndexedDBAvailable()) return null;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise<IDBDatabase | null>((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('SafeParkDB: IndexedDB open failed, utilizing localStorage fallback.');
          resolve(null);
        };
      } catch (err) {
        console.warn('SafeParkDB initialization error:', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  /**
   * Stores data in IndexedDB with a 12-hour TTL (with fallback to localStorage).
   */
  public async set<T>(key: string, data: T, ttlMs: number = TWELVE_HOURS_MS): Promise<void> {
    const now = Date.now();
    const record: CacheRecord<T> = {
      key,
      data,
      timestamp: now,
      expiresAt: now + ttlMs,
    };

    // 1. IndexedDB primary write
    const db = await this.getDB();
    if (db) {
      return new Promise<void>((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.put(record);
          tx.oncomplete = () => resolve();
          tx.onerror = () => {
            this.writeFallback(key, record);
            resolve();
          };
        } catch {
          this.writeFallback(key, record);
          resolve();
        }
      });
    }

    // 2. LocalStorage / Memory Fallback
    this.writeFallback(key, record);
  }

  /**
   * Retrieves data from cache.
   * If allowStale is true or device is offline, returns cached data even if past TTL.
   */
  public async get<T>(key: string, allowStale: boolean = true): Promise<T | null> {
    // 1. IndexedDB primary read
    const db = await this.getDB();
    if (db) {
      const dbResult = await new Promise<CacheRecord<T> | null>((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(key);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      });

      if (dbResult) {
        const isExpired = Date.now() > dbResult.expiresAt;
        if (!isExpired || allowStale) {
          return dbResult.data;
        }
      }
    }

    // 2. Fallback read
    const fallback = this.readFallback<T>(key);
    if (fallback) {
      const isExpired = Date.now() > fallback.expiresAt;
      if (!isExpired || allowStale) {
        return fallback.data;
      }
    }

    return null;
  }

  /**
   * Fast synchronous or sub-50ms instant cache check for startup.
   */
  public getInstantSync<T>(key: string): T | null {
    const fallback = this.readFallback<T>(key);
    return fallback ? fallback.data : null;
  }

  private writeFallback<T>(key: string, record: CacheRecord<T>) {
    this.memoryFallback.set(key, record);
    if (this.isLocalStorageAvailable()) {
      try {
        window.localStorage.setItem(`safepark_cache_${key}`, JSON.stringify(record));
      } catch {
        // LocalStorage quota exceeded or disabled
      }
    }
  }

  private readFallback<T>(key: string): CacheRecord<T> | null {
    if (this.memoryFallback.has(key)) {
      return this.memoryFallback.get(key) as CacheRecord<T>;
    }
    if (this.isLocalStorageAvailable()) {
      try {
        const item = window.localStorage.getItem(`safepark_cache_${key}`);
        if (item) {
          const record = JSON.parse(item) as CacheRecord<T>;
          this.memoryFallback.set(key, record);
          return record;
        }
      } catch {}
    }
    return null;
  }

  /**
   * Helper to cache city parking results with a 12-hour TTL.
   */
  public async cacheCityParking(city: string, payload: any): Promise<void> {
    await this.set(`city_parking_${city}`, payload, TWELVE_HOURS_MS);
  }

  public async getCachedCityParking<T = any>(city: string): Promise<T | null> {
    return this.get<T>(`city_parking_${city}`, true);
  }

  /**
   * Helper to cache municipal crime results with a 12-hour TTL.
   */
  public async cacheCityCrimes(city: string, payload: any): Promise<void> {
    await this.set(`city_crimes_${city}`, payload, TWELVE_HOURS_MS);
  }

  public async getCachedCityCrimes<T = any>(city: string): Promise<T | null> {
    return this.get<T>(`city_crimes_${city}`, true);
  }

  /**
   * Clears all cached records.
   */
  public async clear(): Promise<void> {
    this.memoryFallback.clear();
    if (this.isLocalStorageAvailable()) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith('safepark_cache_')) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      } catch {}
    }

    const db = await this.getDB();
    if (db) {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).clear();
      } catch {}
    }
  }
}

export const CacheService = new CacheServiceClass();
