export interface LegalDisclaimer {
  id: string;
  type: 'bailment_waiver' | 'non_guarantee_risk' | 'real_time_advisory' | 'user_hazard_disclaimer';
  title: string;
  body: string;
  enforceConsent: boolean;
  version: string;
}

export const LEGAL_SAFEGUARDS: Record<string, LegalDisclaimer> = {
  NON_GUARANTEE_DISCLAIMER: {
    id: 'lg-001',
    type: 'non_guarantee_risk',
    title: 'Informational Risk Advisory Only',
    body: 'SafePark Composite Safety Index (CSI) ratings and walking intelligence are aggregate risk estimations generated from historic, municipal, and algorithmic data. SafePark does not guarantee safety, property security, or crime prevention. Drivers retain full responsibility for vehicle parking decisions and property custody.',
    enforceConsent: true,
    version: '2026.1',
  },
  BAILMENT_WAIVER: {
    id: 'lg-002',
    type: 'bailment_waiver',
    title: 'No Bailment or Custody Created',
    body: 'Use of the SafePark navigation platform does not constitute a contract of bailment. SafePark does not assume care, custody, or control of your vehicle, contents, or personal property.',
    enforceConsent: false,
    version: '2026.1',
  },
  ANTI_BIAS_SUBMISSION_POLICY: {
    id: 'lg-003',
    type: 'user_hazard_disclaimer',
    title: 'Objective Physical Hazard Reporting Policy',
    body: 'To protect civil rights and prevent biased reporting, SafePark restricts community submissions strictly to verifiable physical and infrastructure defects (e.g., broken glass, outages). All subjective descriptors are automatically filtered and rejected.',
    enforceConsent: false,
    version: '2026.1',
  }
};
