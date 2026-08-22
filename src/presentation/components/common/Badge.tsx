import React from 'react';
import { SAFE_PARK_TOKENS, getStatusStyle } from '../../../theme/tokens';

interface BadgeProps {
  score?: number;
  label?: string;
  variant?: 'status' | 'brand' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  score,
  label,
  variant = 'status',
  size = 'md'
}) => {
  if (variant === 'status' && score !== undefined) {
    const status = getStatusStyle(score);
    const padding = size === 'sm' ? '2px 8px' : size === 'lg' ? '6px 14px' : '3px 10px';
    const fontSize = size === 'sm' ? '0.725rem' : size === 'lg' ? '0.95rem' : '0.8rem';

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: status.bg,
          color: status.text,
          border: `1px solid ${status.border}`,
          borderRadius: SAFE_PARK_TOKENS.borderRadius.pill,
          padding,
          fontSize,
          fontWeight: 800,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}
      >
        <span
          style={{
            width: size === 'sm' ? '6px' : '8px',
            height: size === 'sm' ? '6px' : '8px',
            borderRadius: '50%',
            backgroundColor: status.dot,
            boxShadow: `0 0 6px ${status.dot}44`,
          }}
        />
        {label || status.label}
        <span className="tabular-nums" style={{ marginLeft: '3px', fontWeight: 800 }}>
          CSI {score}
        </span>
      </span>
    );
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: variant === 'brand' ? SAFE_PARK_TOKENS.colors.brand.primaryLight : '#F1F5F9',
        color: variant === 'brand' ? SAFE_PARK_TOKENS.colors.brand.primary : '#334155',
        border: `1px solid ${variant === 'brand' ? '#BFDBFE' : '#E2E8F0'}`,
        borderRadius: SAFE_PARK_TOKENS.borderRadius.pill,
        padding: '3px 9px',
        fontSize: '0.775rem',
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
};
