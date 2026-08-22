import { describe, it, expect } from 'vitest';
import { SanityRunner } from '../utils/SanityRunner';

describe('Production Preflight Sanity Runner', () => {
  it('passes all automated invariant and WCAG contrast checks', () => {
    const report = SanityRunner.runAllPreflightChecks();
    expect(report.passed).toBe(true);
    expect(report.totalChecks).toBeGreaterThanOrEqual(5);
    for (const check of report.results) {
      expect(check.status).toBe('PASS');
    }
  });
});
