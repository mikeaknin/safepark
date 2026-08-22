/**
 * SafePark Centralized UI Token Dictionary
 * Strict adherence to WCAG 2.1 AA / AAA Accessibility Standards
 */

export const SAFE_PARK_TOKENS = {
  colors: {
    // Brand Tokens (Strictly for UI chrome, CTAs, navigation accents)
    brand: {
      primary: '#2C73D2',      // Primary Brand Blue
      primaryHover: '#225cb0',
      primaryActive: '#1a498f',
      primaryLight: '#E8F1FC',
    },

    // Surface & Layout (Dark Slate high contrast palette)
    surface: {
      primaryDark: '#1E293B',  // Slate 800 (Primary Dark Surface - 12.60:1 WCAG AAA against white)
      secondaryDark: '#0F172A', // Slate 900 (Canvas Background)
      cardDark: '#334155',     // Slate 700 (Elevated Map Cards)
      borderDark: '#475569',   // Slate 600 (Subtle dividers)
      overlay: 'rgba(15, 23, 42, 0.85)',
    },

    // Foreground / Content
    text: {
      primary: '#FFFFFF',      // White Foreground (12.60:1 contrast ratio against #1E293B)
      secondary: '#94A3B8',    // Slate 400 (Readable metadata)
      muted: '#64748B',        // Slate 500
      inverse: '#0F172A',      // Slate 900
    },

    // STRICT STATUS ISOLATION (Semantic Only - NEVER use Brand Blue for status)
    status: {
      lowRisk: {
        hex: '#22C55E',        // Low Risk Green (CSI 75 - 100)
        label: 'Low Risk',
        bg: 'rgba(34, 197, 94, 0.15)',
        border: '#22C55E',
      },
      moderateRisk: {
        hex: '#F59E0B',        // Moderate Risk Amber (CSI 50 - 74)
        label: 'Moderate Risk',
        bg: 'rgba(245, 158, 11, 0.15)',
        border: '#F59E0B',
      },
      highRisk: {
        hex: '#EF4444',        // High Risk Red (CSI 0 - 49)
        label: 'High Risk',
        bg: 'rgba(239, 68, 68, 0.15)',
        border: '#EF4444',
      }
    }
  },

  typography: {
    fontFamilies: {
      header: "'Poppins', sans-serif",
      body: "'Inter', sans-serif",
      tabularMetric: "'JetBrains Mono', monospace",
    },
    weights: {
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
    fontFeatureSettings: {
      tabularNumbers: "'tnum' on, 'lnum' on",
    }
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },

  borderRadius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    pill: '9999px',
  },

  shadows: {
    card: '0 4px 20px -2px rgba(0, 0, 0, 0.35)',
    sheet: '0 -4px 30px 0 rgba(0, 0, 0, 0.5)',
    glowBlue: '0 0 15px rgba(44, 115, 210, 0.4)',
    glowGreen: '0 0 15px rgba(34, 197, 94, 0.4)',
    glowAmber: '0 0 15px rgba(245, 158, 11, 0.4)',
    glowRed: '0 0 15px rgba(239, 68, 68, 0.4)',
  }
} as const;

/**
 * Helper to determine semantic status styling strictly isolated from Brand Blue.
 * Rule: CSI >= 75: Low Risk (Green)
 *       CSI >= 50: Moderate Risk (Amber)
 *       CSI <  50: High Risk (Red)
 */
export function getStatusStyle(csiScore: number) {
  if (csiScore >= 75) {
    return SAFE_PARK_TOKENS.colors.status.lowRisk;
  }
  if (csiScore >= 50) {
    return SAFE_PARK_TOKENS.colors.status.moderateRisk;
  }
  return SAFE_PARK_TOKENS.colors.status.highRisk;
}

export type RiskLevel = 'low' | 'moderate' | 'high';

export function getRiskLevel(csiScore: number): RiskLevel {
  if (csiScore >= 75) return 'low';
  if (csiScore >= 50) return 'moderate';
  return 'high';
}
