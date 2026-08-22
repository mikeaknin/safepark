import { RiskLevel } from '../../theme/tokens';

export interface ScoreComponentBreakdown {
  rawScore: number;       // 0 - 100
  weightedScore: number;  // weighted contribution
  weightPercentage: number;
  description: string;
  factorDetails: Record<string, string | number | boolean>;
}

export interface CompositeSafetyIndex {
  id: string;
  spotId: string;
  totalScore: number;     // 0 - 100
  riskLevel: RiskLevel;   // 'low' | 'moderate' | 'high'
  timestamp: string;
  isNightTime: boolean;
  components: {
    crimeScore: ScoreComponentBreakdown;        // Geocoded historical/real-time crime
    lightingScore: ScoreComponentBreakdown;     // Municipal smart lighting & solar cycle
    infrastructureScore: ScoreComponentBreakdown; // Gated barriers, cameras, garage enclosure
    hazardScore: ScoreComponentBreakdown;       // Time-decayed verified hazard reports
  };
  keyRiskFactors: string[];
  recommendations: string[];
}
