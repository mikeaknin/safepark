import { IHazardRepository } from '../../domain/repositories/IHazardRepository';
import { HazardReport, HazardValidationResult } from '../../domain/models/HazardReport';
import { AntiBiasValidator } from '../../domain/services/AntiBiasValidator';
import { MOCK_PARKING_LOCATIONS } from '../mock/mockParkingSpots';
import { CsiEngine } from '../../domain/services/CsiEngine';

export class HazardRepositoryImpl implements IHazardRepository {
  private locations = MOCK_PARKING_LOCATIONS;

  public async getActiveHazardsForLocation(spotId: string): Promise<HazardReport[]> {
    const loc = this.locations.find(l => l.id === spotId);
    return loc ? [...loc.activeHazards] : [];
  }

  public async submitHazardReport(
    spotId: string,
    hazardType: string,
    notes: string,
    lat: number,
    lng: number,
    photoAttached: boolean = false
  ): Promise<HazardValidationResult> {
    const validation = AntiBiasValidator.validateReport(
      spotId,
      hazardType,
      notes,
      lat,
      lng,
      photoAttached
    );

    if (validation.isValid && validation.sanitizedReport) {
      const loc = this.locations.find(l => l.id === spotId);
      if (loc) {
        loc.activeHazards.unshift(validation.sanitizedReport as HazardReport);
        // Automatically recalculate CSI with new verified hazard
        loc.csi = CsiEngine.calculate(
          loc.id,
          loc.crimeData,
          loc.lighting,
          loc.infrastructure,
          loc.activeHazards
        );
      }
    }

    return validation;
  }

  public async upvoteHazardConfirmation(hazardId: string): Promise<boolean> {
    for (const loc of this.locations) {
      const hz = loc.activeHazards.find(h => h.id === hazardId);
      if (hz) {
        hz.confirmedByWitnessCount += 1;
        loc.csi = CsiEngine.calculate(loc.id, loc.crimeData, loc.lighting, loc.infrastructure, loc.activeHazards);
        return true;
      }
    }
    return false;
  }
}
