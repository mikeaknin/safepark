/**
 * SafePark Centralized Theme & Design Tokens
 * Strict adherence to WCAG 2.1 AA / AAA Accessibility Standards
 */

export { SAFE_PARK_TOKENS, getStatusStyle, getRiskLevel } from '../../theme/tokens';
export type { RiskLevel } from '../../theme/tokens';

export const THEME = {
  colors: {
    canvasBackground: '#0F172A',
    surfaceContainer: '#1E293B',
    surfaceElevated: '#334155',
    border: 'rgba(51, 65, 85, 0.7)',
    brandBlue: '#2C73D2',
    brandBlueHover: '#225cb0',
    statusLowRisk: '#22C55E',
    statusModerateRisk: '#F59E0B',
    statusHighRisk: '#EF4444',
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
  touch: {
    minTargetSize: '44px',
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '20px',
    pill: '9999px',
  },
  shadows: {
    card: '0 4px 20px rgba(0, 0, 0, 0.35)',
    drawer: '0 -10px 36px rgba(0, 0, 0, 0.6)',
    header: '0 8px 32px rgba(0, 0, 0, 0.5)',
  }
};
