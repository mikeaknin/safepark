import React from 'react';

export interface SafeParkLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  textColor?: 'dark' | 'light';
  onClick?: () => void;
}

export const SafeParkLogo: React.FC<SafeParkLogoProps> = ({
  size = 36,
  showText = false,
  className = '',
  textColor = 'dark',
  onClick,
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      {/* Clean Minimalist Geometric P with Emerald Beacon Dot (No Shield) */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
        aria-label="SafePark Logo"
      >
        <defs>
          <linearGradient id={`bgGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id={`pGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>

          <linearGradient id={`emeraldGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <filter id={`emeraldGlow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Squircle Surface */}
        <rect
          width="512"
          height="512"
          rx="120"
          fill={`url(#bgGrad-${size})`}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="6"
        />

        {/* Minimalist Geometric P */}
        <path
          d="M 148 108
             L 276 108
             C 342 108, 396 162, 396 228
             C 396 294, 342 348, 276 348
             L 204 348
             L 204 404
             C 204 419, 192 432, 176 432
             C 160 432, 148 419, 148 404
             Z
             M 204 164
             L 204 292
             L 276 292
             C 311 292, 340 263, 340 228
             C 340 193, 311 164, 276 164
             Z"
          fill={`url(#pGrad-${size})`}
          fillRule="evenodd"
        />

        {/* Emerald Beacon Dot inside loop of P */}
        <circle
          cx="272"
          cy="228"
          r="32"
          fill={`url(#emeraldGrad-${size})`}
          filter={`url(#emeraldGlow-${size})`}
          stroke="#FFFFFF"
          strokeWidth="6"
        />
      </svg>

      {/* Wordmark and Navigation Sub-Badge */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: size >= 36 ? '1.15rem' : '1rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: textColor === 'light' ? '#FFFFFF' : '#0F172A',
              }}
            >
              Safe<span style={{ color: '#2563EB' }}>Park</span>
            </span>
            <span
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                color: '#15803D',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '4px',
                padding: '1px 5px',
                fontSize: '0.625rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              SF
            </span>
          </div>
          <span style={{ fontSize: '0.675rem', color: '#64748B', fontWeight: 500 }}>
            Smart Parking Radar
          </span>
        </div>
      )}
    </div>
  );
};
