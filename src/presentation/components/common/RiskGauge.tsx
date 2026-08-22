import React, { useEffect, useState } from 'react';
import { getStatusStyle } from '../../../theme/tokens';

interface RiskGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  size = 110,
  strokeWidth = 10,
}) => {
  const status = getStatusStyle(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Animated Count-Up display
  const [displayScore, setDisplayScore] = useState<number>(0);

  useEffect(() => {
    let start = 0;
    const duration = 600;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const stepIncrement = (score - start) / totalSteps;

    const timer = setInterval(() => {
      start += stepIncrement;
      if ((stepIncrement >= 0 && start >= score) || (stepIncrement < 0 && start <= score)) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Composite Safety Index: ${score} out of 100, status ${status.label}`}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#334155"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Dynamic Animated Status Progress Bar */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={status.hex}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease' }}
        />
      </svg>

      {/* Central Numeric Readout with Tabular numbers */}
      <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
        <div className="tabular-nums" style={{ fontSize: size * 0.28, color: '#FFFFFF', lineHeight: 1 }}>
          {displayScore}
        </div>
        <div
          style={{
            fontSize: '0.625rem',
            color: status.hex,
            fontWeight: 800,
            textTransform: 'uppercase',
            marginTop: 2,
            letterSpacing: '0.04em',
          }}
        >
          {status.label.replace(' Risk', '')}
        </div>
      </div>
    </div>
  );
};
