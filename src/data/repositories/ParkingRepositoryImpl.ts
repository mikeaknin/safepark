import { IParkingRepository } from '../../domain/repositories/IParkingRepository';
import { ParkingLocation } from '../../domain/models/ParkingLocation';
import { OfflineCacheService } from '../../domain/services/OfflineCacheService';
import { LiveParkingService } from '../../services/liveParkingService';

export class ParkingRepositoryImpl implements IParkingRepository {
  private locations: ParkingLocation[] = [];

  public async getAllParkingLocations(): Promise<ParkingLocation[]> {
    // 1. Subterranean Offline Check
    if (OfflineCacheService.isSubterraneanOffline()) {
      const cached = OfflineCacheService.getCachedParkingLocations();
      if (cached && cached.length > 0) {
        return cached;
      }
    }

    // 2. Fetch live data
    try {
      if (this.locations.length === 0) {
        const live = await LiveParkingService.loadCityLiveParking('sf');
        this.locations = live.scoredLocations;
      }
      return this.locations;
    } catch {
      const cached = OfflineCacheService.getCachedParkingLocations();
      return cached && cached.length > 0 ? cached : [];
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
