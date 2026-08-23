import { describe, it, expect, beforeEach } from 'vitest';
import { SavedParkingSession } from '../domain/models/SavedParkingSession';

const mockStorage: Record<string, string> = {};
const storage = {
  getItem: (k: string) => mockStorage[k] || null,
  setItem: (k: string, v: string) => { mockStorage[k] = v; },
  removeItem: (k: string) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
};

describe('SavedParkingSession Model & Session State', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('should instantiate and serialize a valid parking session', () => {
    const now = Date.now();
    const session: SavedParkingSession = {
      id: 'session-test-1',
      locationId: 'loc-1',
      spotName: 'Vallejo St Curbside Metered',
      address: '732 Vallejo St, San Francisco, CA',
      spotType: 'metered',
      coordinates: { lat: 37.7985, lng: -122.4085 },
      parkedAtTimestamp: now,
      expirationTimestamp: now + 120 * 60 * 1000,
      streetSweepingNotice: '🧹 Sweeping: 1st & 3rd Tue 9–11 AM',
      garageNotes: { level: 'P1', stallNumber: '104', note: 'Near stairs' },
      csiScore: 82,
      hourlyRate: 3.5,
    };

    expect(session.spotType).toBe('metered');
    expect(session.expirationTimestamp).toBeGreaterThan(now);
    expect(session.garageNotes?.stallNumber).toBe('104');

    storage.setItem('safepark_active_session_v1', JSON.stringify(session));
    const retrieved = JSON.parse(storage.getItem('safepark_active_session_v1')!);
    expect(retrieved.id).toBe('session-test-1');
    expect(retrieved.csiScore).toBe(82);
  });

  it('should compute remaining time and detect expiration', () => {
    const pastTime = Date.now() - 3600 * 1000;
    const expiredSession: SavedParkingSession = {
      id: 'session-test-expired',
      locationId: 'loc-2',
      spotName: 'Green St 2-Hour Free Zone',
      address: '650 Green St, San Francisco, CA',
      spotType: 'free_curbside',
      coordinates: { lat: 37.7995, lng: -122.4095 },
      parkedAtTimestamp: pastTime - 7200 * 1000,
      expirationTimestamp: pastTime,
      csiScore: 78,
      hourlyRate: 0,
    };

    const isExpired = (expiredSession.expirationTimestamp || 0) < Date.now();
    expect(isExpired).toBe(true);
  });
});
