import React, { useState } from 'react';
import { ShieldAlert, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { LEGAL_SAFEGUARDS } from '../../../domain/models/LegalNotice';
import { SAFE_PARK_TOKENS } from '../../../theme/tokens';

export const LegalBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
        padding: '10px 14px',
        margin: '12px 0',
        fontSize: '0.8rem',
        color: '#94A3B8',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={16} color={SAFE_PARK_TOKENS.colors.brand.primary} />
          <span style={{ color: '#FFFFFF', fontWeight: 600 }}>
            {LEGAL_SAFEGUARDS.NON_GUARANTEE_DISCLAIMER.title}
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              backgroundColor: '#334155',
              color: '#CBD5E1',
              padding: '1px 6px',
              borderRadius: '4px',
            }}
          >
            v{LEGAL_SAFEGUARDS.NON_GUARANTEE_DISCLAIMER.version}
          </span>
        </div>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Toggle legal notice details"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #334155', lineHeight: 1.4 }}>
          <p style={{ marginBottom: '8px' }}>
            {LEGAL_SAFEGUARDS.NON_GUARANTEE_DISCLAIMER.body}
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '6px', color: '#CBD5E1' }}>
            <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Bailment Waiver:</strong> {LEGAL_SAFEGUARDS.BAILMENT_WAIVER.body}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
