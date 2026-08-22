import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SAFE_PARK_TOKENS } from '../../../theme/tokens';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  Pause,
  Layers,
  Shield,
  Bluetooth,
  Footprints,
  AlertTriangle
} from 'lucide-react';

export interface TourStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

interface DemoTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoTour: React.FC<DemoTourProps> = ({ isOpen, onClose }) => {
  const {
    setCurrentView,
    setSelectedLocation,
    locations,
    setFilters,
    setShowLightingHeatmap,
    setInspectingCsiLocation,
    setSafeWalkLocation,
    setReportingHazardLocation,
    handleParkHere,
    showToast,
  } = useApp();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const targetSpot = locations[0] || null;

  const tourSteps: TourStep[] = [
    {
      stepNumber: 1,
      title: 'Step 1: Destination Search & Risk Mapping',
      subtitle: 'Context-Aware Urban Risk Telemetry',
      description:
        'SafePark shifts driver behavior from availability to safety. Notice the active Municipal Lighting Density Heatmap overlay (68 Lux smart corridor vs. 6 Lux dark blindspot) and semantic status pins (Green = Low Risk ≥75, Amber = Moderate 50-74, Red = High <50).',
      icon: <Layers size={20} color="#38BDF8" />,
      action: () => {
        setCurrentView('driver');
        setFilters(prev => ({ ...prev, minCsi: 0 }));
        setShowLightingHeatmap(true);
        if (targetSpot) setSelectedLocation(targetSpot);
        setInspectingCsiLocation(null);
        setSafeWalkLocation(null);
        setReportingHazardLocation(null);
      },
    },
    {
      stepNumber: 2,
      title: 'Step 2: Composite Safety Index (CSI) Deep-Dive',
      subtitle: 'Dynamic Mathematical Weight Formulation',
      description:
        'CSI dynamically scores the spot from 0 to 100 ingesting: Historical/Real-Time Property Crime (40%), Municipal Smart Lighting & Solar Zenith (25%), Physical Infrastructure & Access (25%), and Exponentially Decayed Community Hazards (10%).',
      icon: <Shield size={20} color="#22C55E" />,
      action: () => {
        setCurrentView('driver');
        if (targetSpot) {
          setSelectedLocation(targetSpot);
          setInspectingCsiLocation(targetSpot);
        }
        setSafeWalkLocation(null);
        setReportingHazardLocation(null);
      },
    },
    {
      stepNumber: 3,
      title: 'Step 3: Post-Parking & Bluetooth Exit Alert',
      subtitle: 'Contextual Property Theft Prevention',
      description:
        'When the driver parks and turns off the engine, Bluetooth disconnects. SafePark detects vehicle exit in background and fires an immediate contextual alert advising the driver to stow charging cables, backpacks, and sunglasses out of cabin view.',
      icon: <Bluetooth size={20} color="#2C73D2" />,
      action: () => {
        setInspectingCsiLocation(null);
        setSafeWalkLocation(null);
        setReportingHazardLocation(null);
        if (targetSpot) {
          handleParkHere(targetSpot);
        }
      },
    },
    {
      stepNumber: 4,
      title: 'Step 4: "Safe Walk Back" Return Navigation',
      subtitle: 'Illuminated High-Lux Pedestrian Corridor',
      description:
        'SafePark calculates turn-by-turn walking routes comparing the high-visibility municipal smart LED corridor (48 Lux avg, continuous CCTV) against unlit alley shortcuts (9 Lux avg, low foot traffic).',
      icon: <Footprints size={20} color="#22C55E" />,
      action: () => {
        setInspectingCsiLocation(null);
        setReportingHazardLocation(null);
        if (targetSpot) {
          setSafeWalkLocation(targetSpot);
        }
      },
    },
    {
      stepNumber: 5,
      title: 'Step 5: Anti-Bias Input Validation Engine',
      subtitle: 'Legal Safeguard & Objective Hazard Whitelist',
      description:
        'To prevent demographic bias and protect civil rights, SafePark rejects all subjective text ("sketchy area", "suspicious crowd"). Community reporting is strictly limited to verifiable physical conditions (broken glass, dead street lamps, forced gates).',
      icon: <AlertTriangle size={20} color="#F59E0B" />,
      action: () => {
        setInspectingCsiLocation(null);
        setSafeWalkLocation(null);
        if (targetSpot) {
          setReportingHazardLocation(targetSpot);
        }
      },
    },
    {
      stepNumber: 6,
      title: 'Step 6: Multi-Sided Ecosystem Tour',
      subtitle: 'CarPlay, B2B Certified Portal & Enterprise API',
      description:
        'SafePark is a complete ecosystem: In-Dash CarPlay Display for drivers, B2B Garage Certification Portal for commercial operators, Enterprise Telemetry API for automotive OEMs/insurers, and verified CSI Safety Receipts.',
      icon: <Sparkles size={20} color="#38BDF8" />,
      action: () => {
        setInspectingCsiLocation(null);
        setSafeWalkLocation(null);
        setReportingHazardLocation(null);
        setCurrentView('b2b_portal');
        showToast('🏢 Switched to B2B Garage Certification Portal View');
      },
    },
  ];

  const currentStep = tourSteps[currentStepIndex];

  // Execute step action on step change
  useEffect(() => {
    if (isOpen && currentStep) {
      currentStep.action();
    }
  }, [currentStepIndex, isOpen]);

  // Auto-play timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && isOpen) {
      timer = setTimeout(() => {
        if (currentStepIndex < tourSteps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 7000);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, isOpen, tourSteps.length]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < tourSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 4000,
        maxWidth: '680px',
        width: '92%',
        backgroundColor: '#1E293B',
        borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
        border: '2px solid #2C73D2',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(44, 115, 210, 0.4)',
        padding: '20px',
        color: '#FFFFFF',
      }}
      role="dialog"
      aria-label="Stakeholder Demo Tour Overlay"
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              backgroundColor: 'rgba(44, 115, 210, 0.2)',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {currentStep.icon}
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase' }}>
              STAKEHOLDER & INVESTOR DEMO TOUR • {currentStepIndex + 1} OF {tourSteps.length}
            </span>
            <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', fontWeight: 700 }}>
              {currentStep.title}
            </h3>
          </div>
        </div>

        {/* Play/Pause & Close Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              backgroundColor: isPlaying ? '#22C55E' : '#334155',
              color: isPlaying ? '#0F172A' : '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title={isPlaying ? 'Pause Auto-Tour' : 'Start Auto-Play Tour'}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? 'Auto: ON' : 'Auto-Play'}</span>
          </button>

          <button
            onClick={onClose}
            style={{
              background: '#334155',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
            aria-label="Exit Demo Tour"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Description Body */}
      <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.5, marginBottom: '16px' }}>
        {currentStep.description}
      </p>

      {/* Progress Dots & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '12px' }}>
        {/* Step Indicator Dots */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {tourSteps.map((s, idx) => (
            <div
              key={s.stepNumber}
              onClick={() => setCurrentStepIndex(idx)}
              style={{
                width: currentStepIndex === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: currentStepIndex === idx ? '#2C73D2' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            style={{
              backgroundColor: '#334155',
              color: currentStepIndex === 0 ? '#64748B' : '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ChevronLeft size={14} /> Previous
          </button>

          <button
            onClick={handleNext}
            style={{
              backgroundColor: SAFE_PARK_TOKENS.colors.brand.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 16px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: SAFE_PARK_TOKENS.shadows.glowBlue,
            }}
          >
            <span>{currentStepIndex === tourSteps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
