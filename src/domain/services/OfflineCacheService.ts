import { ParkingLocation } from '../models/ParkingLocation';
import { ParkingHistoryItem } from '../models/UserProfile';

const CACHE_KEYS = {
  LOCATIONS: 'safepark_cached_locations_v1',
  ACTIVE_SESSION: 'safepark_cached_active_session_v1',
  LAST_SYNC: 'safepark_last_sync_timestamp',
  SUBTERRANEAN_SIMULATION: 'safepark_subterranean_mode_active',
};

export type ConnectivityStatus = 'online' | 'subterranean_offline' | 'degraded';

export class OfflineCacheService {
  private static listeners: Array<(status: ConnectivityStatus) => void> = [];
  private static isSubterraneanForced: boolean = false;

  public static initialize(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.notifyStatusChange());
      window.addEventListener('offline', () => this.notifyStatusChange());
    }
  }

  public static subscribe(listener: (status: ConnectivityStatus) => void): () => void {
    this.listeners.push(listener);
    listener(this.getCurrentStatus());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public static getCurrentStatus(): ConnectivityStatus {
    if (this.isSubterraneanForced) {
      return 'subterranean_offline';
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'subterranean_offline';
    }
    return 'online';
  }

  public static isSubterraneanOffline(): boolean {
    return this.getCurrentStatus() === 'subterranean_offline';
  }

  public static toggleSubterraneanSimulation(forceOffline?: boolean): boolean {
    if (forceOffline !== undefined) {
      this.isSubterraneanForced = forceOffline;
    } else {
      this.isSubterraneanForced = !this.isSubterraneanForced;
    }
    this.notifyStatusChange();
    return this.isSubterraneanForced;
  }

  private static notifyStatusChange(): void {
    const status = this.getCurrentStatus();
    this.listeners.forEach(fn => fn(status));
  }

  /**
   * Cache parking locations with calculated CSI scores for offline retrieval
   */
  public static cacheParkingLocations(locations: ParkingLocation[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CACHE_KEYS.LOCATIONS, JSON.stringify(locations));
        localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for offline parking cache:', e);
    }
  }

  /**
   * Retrieve cached locations during subterranean signal blackouts
   */
  public static getCachedParkingLocations(): ParkingLocation[] | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(CACHE_KEYS.LOCATIONS);
        if (data) {
          return JSON.parse(data) as ParkingLocation[];
        }
      }
    } catch (e) {
      console.warn('Failed to read cached locations:', e);
    }
    return null;
  }

  /**
   * Store active parked session in local persistent cache
   */
  public static cacheActiveSession(session: ParkingLocation | null): void {
    try {
      if (typeof localStorage !== 'undefined') {
        if (session) {
          localStorage.setItem(CACHE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
        } else {
          localStorage.removeItem(CACHE_KEYS.ACTIVE_SESSION);
        }
      }
    } catch (e) {
      console.warn('Failed to cache active session:', e);
    }
  }

  public static getCachedActiveSession(): ParkingLocation | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(CACHE_KEYS.ACTIVE_SESSION);
        if (data) {
          return JSON.parse(data) as ParkingLocation;
        }
      }
    } catch (e) {
      console.warn('Failed to retrieve cached session:', e);
    }
    return null;
  }

  public static getLastSyncTime(): string {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(CACHE_KEYS.LAST_SYNC) || 'Just now';
      }
    } catch {}
    return 'Just now';
  }
}
