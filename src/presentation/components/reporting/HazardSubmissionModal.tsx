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
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 48px rgba(15, 23, 42, 0.2)',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          color: '#0F172A',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#B45309', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Anti-Bias Physical Hazard Reporting
            </div>
            <h2 style={{ fontSize: '1.2rem', color: '#0F172A', fontWeight: 800 }}>Report Verifiable Hazard</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Legal Anti-Bias Safeguard Notice */}
        <div
          style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            padding: '10px 12px',
            marginBottom: '16px',
            fontSize: '0.775rem',
            color: '#1E40AF',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
          }}
        >
          <ShieldAlert size={16} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#1E3A8A' }}>Legal Anti-Bias Policy Enforced:</strong>
            {' '}Subjective labels (e.g. "sketchy area", "shady people") are automatically rejected. All submissions must document verifiable physical hazards.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Hazard Type Selector */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.825rem', color: '#334155', marginBottom: '6px', fontWeight: 700 }}>
              Physical Hazard Category (Required)
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#0F172A',
                fontSize: '0.85rem',
                fontWeight: 600,
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
              backgroundColor: '#F8FAFC',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#0F172A', fontWeight: 600 }}>
              <Camera size={16} color="#15803D" />
              <span>Attach Geo-tagged Physical Photo Evidence</span>
            </div>
            <input
              type="checkbox"
              checked={photoAttached}
              onChange={(e) => setPhotoAttached(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          {/* Notes Area */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.825rem', color: '#334155', marginBottom: '6px', fontWeight: 700 }}>
              Physical Observations & Exact Stall Location
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Two piles of broken tempered glass next to stall 14 on 2nd level."
              style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#0F172A',
                fontSize: '0.85rem',
                resize: 'none',
              }}
            />
          </div>

          {/* Quick Pre-fill Helpers for Automated E2E Testing */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={handleTestSubjective}
              style={{
                backgroundColor: '#FFF1F2',
                color: '#9F1239',
                border: '1px solid #FECDD3',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.725rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Test Subjective (Will Reject)
            </button>
            <button
              type="button"
              onClick={handleTestObjective}
              style={{
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.725rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Test Objective Glass (Will Approve)
            </button>
          </div>

          {/* Real-time Validation Result Box */}
          {validationResult && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                backgroundColor: validationResult.isValid ? '#ECFDF5' : '#FFF1F2',
                border: `1px solid ${validationResult.isValid ? '#A7F3D0' : '#FECDD3'}`,
                color: validationResult.isValid ? '#065F46' : '#9F1239',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}>
                {validationResult.isValid ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Report Approved for Community Moderation Queue</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} />
                    <strong>Submission Rejected</strong>
                  </>
                )}
              </div>
              <p style={{ marginTop: '4px', fontSize: '0.775rem' }}>
                {validationResult.isValid
                  ? 'Verifiable hazard report accepted.'
                  : validationResult.rejectionReason || 'Submission rejected by Anti-Bias Policy: subjective terms detected.'}
              </p>
            </div>
          )}

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#F1F5F9',
                color: '#475569',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
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
