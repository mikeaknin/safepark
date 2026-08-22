import { describe, it, expect } from 'vitest';
import { AntiBiasValidator } from '../domain/services/AntiBiasValidator';

describe('Anti-Bias Input Validation Engine (Legal Safeguards)', () => {
  it('rejects submissions with subjective profiling terms', () => {
    const subjectivePhrases = [
      'This area looks sketchy at night',
      'Suspicious people hanging out near the cars',
      'Feels like a shady neighborhood',
      'Ghetto vibe around the corner',
      'Creepy atmosphere',
      'Loitering crowd near the curb',
    ];

    for (const phrase of subjectivePhrases) {
      const result = AntiBiasValidator.validateReport(
        'spot-1',
        'broken_glass_pavement',
        phrase,
        37.78,
        -122.40
      );

      expect(result.isValid).toBe(false);
      expect(result.rejectionReason).toContain('Anti-Bias Policy');
      expect(result.flaggedSubjectiveTerms?.length).toBeGreaterThan(0);
    }
  });

  it('accepts verifiable physical hazard reports with objective notes', () => {
    const objectivePhrases = [
      'Fresh tempered glass fragments scattered across stall 3',
      'East municipal streetlight #4 fixture is unpowered and dark',
      'Physical barrier gate arm is broken and stuck open',
      'Overgrown tree branches obstructing line of sight to vehicles',
    ];

    for (const phrase of objectivePhrases) {
      const result = AntiBiasValidator.validateReport(
        'spot-1',
        'broken_glass_pavement',
        phrase,
        37.78,
        -122.40,
        true
      );

      expect(result.isValid).toBe(true);
      expect(result.sanitizedReport).toBeDefined();
      expect(result.sanitizedReport?.notes).toBe(phrase);
    }
  });

  it('rejects invalid unapproved hazard categories', () => {
    const result = AntiBiasValidator.validateReport(
      'spot-1',
      'bad_people_hazard', // unapproved subjective type
      'Broken glass on curb',
      37.78,
      -122.40
    );

    expect(result.isValid).toBe(false);
    expect(result.rejectionReason).toContain('Invalid hazard category');
  });
});
