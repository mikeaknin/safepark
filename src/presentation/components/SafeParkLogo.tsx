import React from 'react';

export interface SafeParkLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export const SafeParkLogo: React.FC<SafeParkLogoProps> = ({
  size = 36,
  showText = false,
  className = '',
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
      {/* SVG Shield-P & Safety Beacon Vector Graphic */}
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

          <linearGradient id={`brandGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#2C73D2" />
          </linearGradient>

          <linearGradient id={`shieldFill-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2C73D2" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* Squircle Surface */}
        <rect
          width="512"
          height="512"
          rx="112"
          fill={`url(#bgGrad-${size})`}
          stroke="rgba(56, 189, 248, 0.25)"
          strokeWidth="6"
        />

        {/* Protective Shield Contour */}
        <path
          d="M 256 70 
             C 335 70, 395 90, 412 125 
             C 412 250, 350 365, 256 442 
             C 162 365, 100 250, 100 125 
             C 117 90, 177 70, 256 70 Z"
          fill={`url(#shieldFill-${size})`}
          stroke={`url(#brandGrad-${size})`}
          strokeWidth="14"
          strokeLinejoin="round"
        />

        {/* Inner Protective Outline */}
        <path
          d="M 256 96 
             C 320 96, 370 112, 386 140 
             C 386 242, 334 338, 256 406 
             C 178 338, 126 242, 126 140 
             C 142 112, 192 96, 256 96 Z"
          fill="none"
          stroke="rgba(56, 189, 248, 0.35)"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Parking P Stem */}
        <rect x="180" y="150" width="36" height="210" rx="18" fill={`url(#brandGrad-${size})`} />

        {/* Parking P Bowl */}
        <path
          d="M 198 150 
             H 275 
             C 325 150, 355 178, 355 222 
             C 355 266, 325 294, 275 294 
             H 198"
          fill="none"
          stroke={`url(#brandGrad-${size})`}
          strokeWidth="36"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Glowing Emerald Safety Beacon */}
        <circle cx="275" cy="222" r="28" fill="#22C55E" opacity="0.45" />
        <circle cx="275" cy="222" r="18" fill="#22C55E" />
        <circle cx="275" cy="222" r="7" fill="#FFFFFF" />

        {/* CSI Grounding Dots */}
        <circle cx="236" cy="385" r="5" fill="#38BDF8" opacity="0.7" />
        <circle cx="256" cy="396" r="6" fill="#22C55E" opacity="0.95" />
        <circle cx="276" cy="385" r="5" fill="#38BDF8" opacity="0.7" />
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
                color: '#FFFFFF',
              }}
            >
              SafePark
            </span>
            <span
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.18)',
                color: '#22C55E',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                borderRadius: '4px',
                padding: '1px 5px',
                fontSize: '0.625rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              SF Navigation
            </span>
          </div>
          <span style={{ fontSize: '0.675rem', color: '#94A3B8', fontWeight: 500 }}>
            San Francisco Municipal Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
