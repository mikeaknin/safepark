import React, { useState } from 'react';
import { ParkingLocation } from '../../../domain/models/ParkingLocation';
import { AntiBiasValidator } from '../../../domain/services/AntiBiasValidator';
import { HazardValidationResult } from '../../../domain/models/HazardReport';
import { SAFE_PARK_TOKENS } from '../../../theme/tokens';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Info, Camera } from 'lucide-react';

interface HazardSubmissionModalProps {
  location: ParkingLocation;
  onClose: () => void;
  onSubmitSuccess: (res: HazardValidationResult) => void;
}

export const HazardSubmissionModal: React.FC<HazardSubmissionModalProps> = ({
  location,
  onClose,
  onSubmitSuccess,
}) => {
  const hazardCatalog = AntiBiasValidator.getVerifiableHazardCatalog();
  const [selectedType, setSelectedType] = useState<string>(hazardCatalog[0].type);
  const [notes, setNotes] = useState<string>('');
  const [photoAttached, setPhotoAttached] = useState<boolean>(true);
  const [validationResult, setValidationResult] = useState<HazardValidationResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = AntiBiasValidator.validateReport(
      location.id,
      selectedType,
      notes,
      location.coordinates.lat,
      location.coordinates.lng,
      photoAttached
    );

    setValidationResult(result);

    if (result.isValid) {
      setTimeout(() => {
        onSubmitSuccess(result);
      }, 1200);
    }
  };

  const handleTestSubjective = () => {
    setNotes('This parking lot has a sketchy crowd hanging out and feels shady.');
  };

  const handleTestObjective = () => {
    setNotes('Curbside stall 4 has a 2-foot pile of broken tempered side window glass on the asphalt.');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#1E293B',
          borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
          border: '1px solid #475569',
          boxShadow: SAFE_PARK_TOKENS.shadows.sheet,
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          color: '#FFFFFF',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase' }}>
              Anti-Bias Physical Hazard Reporting
            </div>
            <h2 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>Report Verifiable Hazard</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#334155',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Legal Anti-Bias Safeguard Notice */}
        <div
          style={{
            backgroundColor: '#0F172A',
            border: '1px solid #334155',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
            padding: '10px 12px',
            marginBottom: '16px',
            fontSize: '0.775rem',
            color: '#94A3B8',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
          }}
        >
          <ShieldAlert size={16} color="#2C73D2" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#FFFFFF' }}>Legal Anti-Bias Policy Enforced:</strong>
            {' '}Subjective labels (e.g. "sketchy area", "shady people") are automatically rejected. All submissions must document verifiable physical hazards.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Hazard Type Selector */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.825rem', color: '#CBD5E1', marginBottom: '6px', fontWeight: 600 }}>
              Physical Hazard Category (Required)
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#0F172A',
                border: '1px solid #475569',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
              }}
            >
              {hazardCatalog.map((h) => (
                <option key={h.type} value={h.type}>
                  {h.title}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Photo Check */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#0F172A',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #334155',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
              <Camera size={16} color="#22C55E" />
              <span>Attach Geo-tagged Physical Photo Evidence</span>
            </div>
            <input
              type="checkbox"
              checked={photoAttached}
              onChange={(e) => setPhotoAttached(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          {/* Objective Description Input */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.825rem', color: '#CBD5E1', fontWeight: 600 }}>
                Objective Physical Description
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleTestSubjective}
                  style={{
                    backgroundColor: '#334155',
                    border: 'none',
                    color: '#EF4444',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                  }}
                >
                  Test Subjective (Will Reject)
                </button>
                <button
                  type="button"
                  onClick={handleTestObjective}
                  style={{
                    backgroundColor: '#334155',
                    border: 'none',
                    color: '#22C55E',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                  }}
                >
                  Test Objective (Pass)
                </button>
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe physical condition (e.g., 'Broken window glass along stall 4 curb' or 'East street lamp #12 dark')"
              rows={3}
              style={{
                width: '100%',
                backgroundColor: '#0F172A',
                border: '1px solid #475569',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Validation Feedback Banner */}
          {validationResult && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '14px',
                backgroundColor: validationResult.isValid ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${validationResult.isValid ? '#22C55E' : '#EF4444'}`,
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
              }}
            >
              {validationResult.isValid ? (
                <CheckCircle2 size={18} color="#22C55E" style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              )}
              <div style={{ fontSize: '0.8rem' }}>
                <strong style={{ color: validationResult.isValid ? '#22C55E' : '#EF4444' }}>
                  {validationResult.isValid ? 'Report Validated & Submitted!' : 'Submission Rejected'}
                </strong>
                <p style={{ color: '#CBD5E1', marginTop: '2px' }}>
                  {validationResult.isValid
                    ? 'Thank you. Verifiable physical observation successfully submitted and factored into time-decayed CSI.'
                    : validationResult.rejectionReason}
                </p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#334155',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: SAFE_PARK_TOKENS.colors.brand.primary,
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Validate & Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
