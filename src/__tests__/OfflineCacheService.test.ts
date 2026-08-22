import { describe, it, expect, beforeEach } from 'vitest';
import { OfflineCacheService } from '../domain/services/OfflineCacheService';
import { MOCK_PARKING_LOCATIONS } from '../data/mock/mockParkingSpots';

describe('Offline & Subterranean Low-Connectivity Cache Service', () => {
  beforeEach(() => {
    OfflineCacheService.toggleSubterraneanSimulation(false);
  });

  it('detects online status under normal operational state', () => {
    const status = OfflineCacheService.getCurrentStatus();
    expect(status).toBe('online');
  });

  it('triggers subterranean offline mode when entering underground garage concrete structures', () => {
    let notifiedStatus = '';
    const unsub = OfflineCacheService.subscribe((status) => {
      notifiedStatus = status;
    });

    OfflineCacheService.toggleSubterraneanSimulation(true);
    expect(OfflineCacheService.getCurrentStatus()).toBe('subterranean_offline');
    expect(notifiedStatus).toBe('subterranean_offline');

    unsub();
  });

  it('caches parking locations and sessions safely without throwing', () => {
    expect(() => {
      OfflineCacheService.cacheParkingLocations(MOCK_PARKING_LOCATIONS);
      OfflineCacheService.cacheActiveSession(MOCK_PARKING_LOCATIONS[0]);
    }).not.toThrow();
  });
});
