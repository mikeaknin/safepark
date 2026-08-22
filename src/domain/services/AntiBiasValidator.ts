import { HazardReport, HazardValidationResult, VerifiableHazardType } from '../models/HazardReport';

export class AntiBiasValidator {
  /**
   * Blacklist of subjective, profiling, or qualitative terms.
   * Reports containing any of these are rejected immediately.
   */
  private static readonly SUBJECTIVE_TERMS = [
    'sketchy',
    'suspicious',
    'shady',
    'ghetto',
    'hood',
    'weird vibe',
    'bad vibe',
    'creepy',
    'unsafe people',
    'dangerous people',
    'loitering',
    'bums',
    'hooligans',
    'thugs',
    'scary looking',
    'weirdos',
    'junkies',
    'unsavory',
    'threat',
    'aggressive person',
    'rough crowd',
    'bad crowd',
  ];

  private static readonly ALLOWED_HAZARD_TYPES: VerifiableHazardType[] = [
    'broken_glass_pavement',
    'failed_street_lamp',
    'broken_security_gate',
    'camera_tampered_or_down',
    'obstructed_sightline_alcove',
    'pavement_debris_puncture_risk',
  ];

  /**
   * Validates a candidate hazard report against anti-bias legal criteria.
   */
  public static validateReport(
    spotId: string,
    hazardType: string,
    notes: string,
    lat: number,
    lng: number,
    photoAttached: boolean = false
  ): HazardValidationResult {
    // 1. Verify hazard type belongs to strictly physical categories
    if (!this.ALLOWED_HAZARD_TYPES.includes(hazardType as VerifiableHazardType)) {
      return {
        isValid: false,
        rejectionReason: `Invalid hazard category. Submissions must be one of the pre-approved physical infrastructure hazards.`,
      };
    }

    // 2. Scan notes for subjective or qualitative bias phrasing
    const lowerNotes = (notes || '').toLowerCase();
    const flaggedTerms: string[] = [];

    for (const term of this.SUBJECTIVE_TERMS) {
      if (lowerNotes.includes(term)) {
        flaggedTerms.push(term);
      }
    }

    if (flaggedTerms.length > 0) {
      try {
        import('../../utils/telemetry').then(({ Telemetry }) => {
          Telemetry.trackEvent('hazard_report_rejected', {
            spotId,
            hazardType,
            flaggedTerms,
          });
        }).catch(() => {});
      } catch {}

      return {
        isValid: false,
        rejectionReason: `Submission rejected by Anti-Bias Policy. Subjective characterizations ("${flaggedTerms.join('", "')}") are prohibited. Reports must describe verifiable physical conditions only (e.g. broken glass, dead street lights).`,
        flaggedSubjectiveTerms: flaggedTerms,
      };
    }

    // 3. Construct validated physical report
    const sanitizedReport: HazardReport = {
      id: `hz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      spotId,
      hazardType: hazardType as VerifiableHazardType,
      reportedAt: new Date().toISOString(),
      confirmedByWitnessCount: 1,
      photoEvidenceVerified: photoAttached,
      notes: notes ? notes.trim() : undefined,
      coordinates: { lat, lng },
    };

    try {
      import('../../utils/telemetry').then(({ Telemetry }) => {
        Telemetry.trackEvent('hazard_report_submitted', {
          spotId,
          hazardType,
          photoAttached,
        });
      }).catch(() => {});
    } catch {}

    return {
      isValid: true,
      sanitizedReport,
    };
  }

  public static getSubjectiveTermsList(): string[] {
    return [...this.SUBJECTIVE_TERMS];
  }

  public static getVerifiableHazardCatalog(): Array<{ type: VerifiableHazardType; title: string; description: string }> {
    return [
      {
        type: 'broken_glass_pavement',
        title: 'Tempered Glass on Pavement',
        description: 'Visible piles of broken automotive glass indicating recent smash-and-grab activity.',
      },
      {
        type: 'failed_street_lamp',
        title: 'Non-Functioning Street Lamp',
        description: 'Burned out or damaged municipal lighting fixture creating dark blind spot.',
      },
      {
        type: 'broken_security_gate',
        title: 'Broken Access Gate / Barrier',
        description: 'Perimeter parking gate stuck open, damaged, or bypassing credential control.',
      },
      {
        type: 'camera_tampered_or_down',
        title: 'Vandalized or Defective CCTV',
        description: 'Security camera unit knocked out of alignment, unpowered, or spray-painted.',
      },
      {
        type: 'obstructed_sightline_alcove',
        title: 'Hidden Alcove / Blind Corner',
        description: 'Overgrown hedges or construction scaffolding blocking line of sight to vehicles.',
      },
      {
        type: 'pavement_debris_puncture_risk',
        title: 'Hazardous Pavement Debris',
        description: 'Sharp metal shards, structural nails, or oil slicks on the parking apron.',
      },
    ];
  }
}
