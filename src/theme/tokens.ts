/**
 * SafePark Centralized UI Token Dictionary
 * Daylight High-Contrast Apple Maps-Style Design Tokens
 * Strict adherence to WCAG 2.1 AA / AAA Accessibility Standards
 */

export const SAFE_PARK_TOKENS = {
  colors: {
    // Brand Tokens (Strictly for UI chrome, CTAs, navigation accents)
    brand: {
      primary: '#2563EB',      // iOS Navigation Blue (Blue 600)
      primaryHover: '#1D4ED8', // Blue 700
      primaryActive: '#1E40AF', // Blue 800
      primaryLight: '#EFF6FF', // Blue 50
    },

    // Surface & Layout (Daylight High-Contrast Slate Palette)
    surface: {
      primary: '#FFFFFF',      // Pure White Card Surface
      primaryDark: '#1E293B',  // Slate 800 (for secondary dark containers & contrast checks)
      secondaryDark: '#0F172A',// Slate 900 (dark code panels)
      canvas: '#F8FAFC',       // Slate 50 Background Canvas
      secondary: '#F1F5F9',    // Slate 100 Elevated Surface
      card: '#FFFFFF',         // Crisp White Cards
      cardDark: '#334155',     // Slate 700
      border: '#E2E8F0',       // Slate 200 Borders
      borderMedium: '#CBD5E1', // Slate 300 Dividers
      borderDark: '#475569',   // Slate 600
      overlay: 'rgba(15, 23, 42, 0.45)', // Translucent backdrop
    },

    // Foreground / Content Typography
    text: {
      primary: '#0F172A',      // Slate 900 (High contrast in-vehicle text)
      secondary: '#475569',    // Slate 600 (Readable secondary specs)
      muted: '#64748B',        // Slate 500 (Subtitles & timestamps)
      light: '#94A3B8',        // Slate 400 (Placeholders)
      inverse: '#FFFFFF',      // White Text for dark action buttons
    },

    // STRICT STATUS ISOLATION (Semantic High-Contrast Daylight Palette)
    status: {
      lowRisk: {
        hex: '#15803D',        // Emerald 700
        label: 'Low Risk',
        bg: '#ECFDF5',         // Emerald 50
        border: '#A7F3D0',     // Emerald 200
        text: '#065F46',       // Emerald 800
        dot: '#22C55E',        // Vibrant Emerald Dot
      },
      moderateRisk: {
        hex: '#B45309',        // Amber 700
        label: 'Moderate Risk',
        bg: '#FFFBEB',         // Amber 50
        border: '#FDE68A',     // Amber 200
        text: '#92400E',       // Amber 800
        dot: '#F59E0B',        // Vibrant Amber Dot
      },
      highRisk: {
        hex: '#BE123C',        // Rose 700
        label: 'High Risk',
        bg: '#FFF1F2',         // Rose 50
        border: '#FECDD3',     // Rose 200
        text: '#9F1239',       // Rose 800
        dot: '#EF4444',        // Vibrant Rose Dot
      }
    }
  },

  typography: {
    fontFamilies: {
      header: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      tabularMetric: "'JetBrains Mono', monospace",
    },
    weights: {
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
      extraBold: 800,
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
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    pill: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    card: '0 4px 16px -2px rgba(15, 23, 42, 0.08)',
    sheet: '0 -4px 32px 0 rgba(15, 23, 42, 0.12)',
    dropdown: '0 12px 36px 0 rgba(15, 23, 42, 0.16)',
    glowBlue: '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
    glowGreen: '0 4px 14px 0 rgba(21, 128, 61, 0.25)',
    glowAmber: '0 4px 14px 0 rgba(180, 83, 9, 0.25)',
    glowRed: '0 4px 14px 0 rgba(190, 18, 60, 0.25)',
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
