import { IParkingRepository } from '../../domain/repositories/IParkingRepository';
import { ParkingLocation } from '../../domain/models/ParkingLocation';
import { MOCK_PARKING_LOCATIONS } from '../mock/mockParkingSpots';
import { OfflineCacheService } from '../../domain/services/OfflineCacheService';
import { SolarLightingAdapter } from '../adapters/SolarLightingAdapter';
import { CrimeDataFeedAdapter } from '../adapters/CrimeDataFeedAdapter';
import { CsiEngine } from '../../domain/services/CsiEngine';

export class ParkingRepositoryImpl implements IParkingRepository {
  private locations: ParkingLocation[] = [...MOCK_PARKING_LOCATIONS];

  public async getAllParkingLocations(): Promise<ParkingLocation[]> {
    // 1. Subterranean Offline Check
    if (OfflineCacheService.isSubterraneanOffline()) {
      const cached = OfflineCacheService.getCachedParkingLocations();
      if (cached && cached.length > 0) {
        return cached;
      }
    }

    // 2. Fetch / Augment with live telemetry feeds
    try {
      const enriched = await Promise.all(
        this.locations.map(async (loc) => {
          const liveCrime = await CrimeDataFeedAdapter.fetchBlockCrimeData(
            loc.coordinates.lat,
            loc.coordinates.lng
          );
          const liveLighting = SolarLightingAdapter.calculateLightingEnvironment(
            loc.coordinates.lat,
            loc.coordinates.lng,
            new Date(),
            !loc.lighting.isDaytime
          );

          const csi = CsiEngine.calculate(
            loc.id,
            liveCrime,
            liveLighting,
            loc.infrastructure,
            loc.activeHazards
          );

          return {
            ...loc,
            crimeData: liveCrime,
            lighting: liveLighting,
            csi,
          };
        })
      );

      this.locations = enriched;
      OfflineCacheService.cacheParkingLocations(enriched);
      return enriched;
    } catch (e) {
      console.warn('Live telemetry feed augmentation fallback:', e);
      return [...this.locations];
    }
  }

  public async getParkingLocationById(id: string): Promise<ParkingLocation | null> {
    const all = await this.getAllParkingLocations();
    const item = all.find(l => l.id === id);
    return item ? { ...item } : null;
  }

  public async searchParkingNear(lat: number, lng: number, radiusMeters: number): Promise<ParkingLocation[]> {
    const all = await this.getAllParkingLocations();
    return all.filter(l => {
      const dLat = (l.coordinates.lat - lat) * 111000;
      const dLng = (l.coordinates.lng - lng) * 111000 * Math.cos(lat * (Math.PI / 180));
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      return dist <= radiusMeters;
    });
  }

  public async reserveOrNavigateToSpot(id: string): Promise<boolean> {
    const loc = this.locations.find(l => l.id === id);
    if (loc && loc.availableSpaces > 0) {
      loc.availableSpaces -= 1;
      return true;
    }
    return false;
  }
}
