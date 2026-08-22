import { ISafetyRepository } from '../../domain/repositories/ISafetyRepository';
import { ParkingLocation } from '../../domain/models/ParkingLocation';
import { CompositeSafetyIndex } from '../../domain/models/SafetyScore';
import { CsiEngine } from '../../domain/services/CsiEngine';
import { MOCK_PARKING_LOCATIONS } from '../mock/mockParkingSpots';
import { OfflineCacheService } from '../../domain/services/OfflineCacheService';

export class SafetyRepositoryImpl implements ISafetyRepository {
  private locations: ParkingLocation[] = [...MOCK_PARKING_LOCATIONS];

  public async calculateScoreForLocation(spotId: string): Promise<CompositeSafetyIndex> {
    const loc = this.locations.find(l => l.id === spotId);
    if (!loc) {
      throw new Error(`Parking location ${spotId} not found`);
    }

    const recalculated = CsiEngine.calculate(
      loc.id,
      loc.crimeData,
      loc.lighting,
      loc.infrastructure,
      loc.activeHazards
    );
    loc.csi = recalculated;
    return recalculated;
  }

  public async getLocationsWithScores(filter?: { minCsi?: number; maxRate?: number; isNight?: boolean }): Promise<ParkingLocation[]> {
    if (OfflineCacheService.isSubterraneanOffline()) {
      const cached = OfflineCacheService.getCachedParkingLocations();
      if (cached && cached.length > 0) {
        return cached.filter(l => l.csi.totalScore >= (filter?.minCsi ?? 0));
      }
    }

    let result = [...this.locations];

    if (filter?.isNight !== undefined) {
      result = result.map(l => {
        const lighting = { ...l.lighting, isDaytime: !filter.isNight };
        const csi = CsiEngine.calculate(l.id, l.crimeData, lighting, l.infrastructure, l.activeHazards);
        return { ...l, lighting, csi };
      });
    }

    if (filter?.minCsi !== undefined) {
      result = result.filter(l => l.csi.totalScore >= (filter.minCsi ?? 0));
    }

    if (filter?.maxRate !== undefined) {
      result = result.filter(l => l.hourlyRate <= (filter.maxRate ?? 999));
    }

    return result;
  }

  public async getLocationById(spotId: string): Promise<ParkingLocation | null> {
    const loc = this.locations.find(l => l.id === spotId);
    return loc ? { ...loc } : null;
  }
}
