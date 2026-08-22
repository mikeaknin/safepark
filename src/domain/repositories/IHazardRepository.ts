import { HazardReport, HazardValidationResult } from '../models/HazardReport';

export interface IHazardRepository {
  getActiveHazardsForLocation(spotId: string): Promise<HazardReport[]>;
  submitHazardReport(
    spotId: string,
    hazardType: string,
    notes: string,
    lat: number,
    lng: number,
    photoAttached?: boolean
  ): Promise<HazardValidationResult>;
  upvoteHazardConfirmation(hazardId: string): Promise<boolean>;
}
