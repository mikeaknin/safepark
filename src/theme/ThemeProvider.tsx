import React, { createContext, useContext, useMemo } from 'react';
import { SAFE_PARK_TOKENS, getStatusStyle, getRiskLevel, RiskLevel } from './tokens';

interface ThemeContextType {
  tokens: typeof SAFE_PARK_TOKENS;
  getStatusStyle: typeof getStatusStyle;
  getRiskLevel: typeof getRiskLevel;
  formatTabularMetric: (val: number | string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useMemo(() => ({
    tokens: SAFE_PARK_TOKENS,
    getStatusStyle,
    getRiskLevel,
    formatTabularMetric: (val: number | string) => `${val}`,
  }), []);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useSafeParkTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useSafeParkTheme must be used within a ThemeProvider');
  }
  return context;
};
