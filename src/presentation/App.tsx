import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { SAFE_PARK_TOKENS } from '../theme/tokens';
import { ViewSwitcher } from './components/common/ViewSwitcher';
import { SubterraneanOfflineBanner } from './components/common/SubterraneanOfflineBanner';
import { SearchAndFilterHeader } from './components/search/SearchAndFilterHeader';
import { SpotCard } from './components/map/SpotCard';
import { InteractiveMapCanvas } from './components/map/InteractiveMapCanvas';
import { CsiBreakdownModal } from './components/scoring/CsiBreakdownModal';
import { HazardSubmissionModal } from './components/reporting/HazardSubmissionModal';
import { SafeWalkModal } from './components/navigation/SafeWalkModal';
import { ExitAlertModal } from './components/triggers/ExitAlertModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { DemoTour } from './components/demo/DemoTour';
import { LegalBanner } from './components/common/LegalBanner';
import { StripeCheckoutModal } from './components/monetization/StripeCheckoutModal';
import { GarageOperatorPortal } from './views/GarageOperatorPortal';
import { CarPlayView } from './views/CarPlayView';
import { EnterpriseApiDashboard } from './views/EnterpriseApiDashboard';
import { UserProfileView } from './views/UserProfileView';
import { AdminOpsDashboard } from './views/AdminOpsDashboard';
import {
  Shield,
  Sun,
  Moon,
  Bluetooth,
  CheckCircle2,
  AlertTriangle,
  Car,
  Footprints,
  Layers,
  WifiOff,
  Sparkles,
  Compass
} from 'lucide-react';

export const App: React.FC = () => {
  const {
    currentView,
    isOnboardingOpen,
    setIsOnboardingOpen,
    isStripeCheckoutOpen,
    setIsStripeCheckoutOpen,
    locations,
    selectedLocation,
    setSelectedLocation,
    isNightMode,
    setIsNightMode,
    parkedLocation,
    setMotionState,
    handleSimulateBluetoothDisconnect,
    handleToggleSubterraneanSignalLoss,
    handleParkHere,
    inspectingCsiLocation,
    setInspectingCsiLocation,
    reportingHazardLocation,
    setReportingHazardLocation,
    safeWalkLocation,
    setSafeWalkLocation,
    activeExitAlert,
    setActiveExitAlert,
    toastMessage,
    showToast,
    handleHazardSubmitted,
  } = useApp();

  const [isDemoTourOpen, setIsDemoTourOpen] = useState<boolean>(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hidden ARIA Live Announcer for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
        {toastMessage}
      </div>

      {/* Top Header / App Bar */}
      <header
        style={{
          backgroundColor: '#1E293B',
          borderBottom: '1px solid #334155',
          padding: '12px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        role="banner"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: SAFE_PARK_TOKENS.colors.brand.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: SAFE_PARK_TOKENS.shadows.glowBlue,
            }}
          >
            <Shield size={22} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                SafePark
              </h1>
              <span
                style={{
                  fontSize: '0.65rem',
                  backgroundColor: '#334155',
                  color: '#38BDF8',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontWeight: 700,
                }}
              >
                PRO
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
              Context-Aware Parking Intelligence & Property Risk Mitigation Platform
            </p>
          </div>
        </div>

        {/* Global Action & Simulation Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Guided Stakeholder Demo Tour Trigger */}
          <button
            onClick={() => setIsDemoTourOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#2C73D2',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '0.775rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: SAFE_PARK_TOKENS.shadows.glowBlue,
            }}
            title="Start Interactive Stakeholder & Investor Tour"
            aria-label="Start interactive demo tour"
          >
            <Sparkles size={14} />
            <span>Guided Tour</span>
          </button>

          {/* Day / Night Environment Toggle */}
          <button
            onClick={() => {
              setIsNightMode(!isNightMode);
              showToast(isNightMode ? '☀️ Switched to Daytime (Solar Lux: 1200)' : '🌙 Switched to Night Mode (Smart Lighting Active)');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#334155',
              color: isNightMode ? '#F59E0B' : '#38BDF8',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.775rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Toggle Municipal Lighting & Solar Zenith Simulation"
            aria-label="Toggle Night or Day simulation"
          >
            {isNightMode ? <Moon size={14} /> : <Sun size={14} />}
            <span>{isNightMode ? 'Night Active' : 'Day Active'}</span>
          </button>

          {/* Subterranean Signal Loss Simulator */}
          <button
            onClick={handleToggleSubterraneanSignalLoss}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#334155',
              color: '#F59E0B',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.775rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Simulate Subterranean Concrete Structure Signal Blackout"
            aria-label="Toggle subterranean offline mode simulation"
          >
            <WifiOff size={14} />
            <span>Signal Loss</span>
          </button>

          {/* Trigger Vehicle Exit Simulator Button */}
          <button
            onClick={handleSimulateBluetoothDisconnect}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#334155',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.775rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Simulate Bluetooth Disconnect / Vehicle Engine Off"
            aria-label="Simulate vehicle exit and bluetooth disconnect trigger"
          >
            <Bluetooth size={14} />
            <span>Simulate Exit</span>
          </button>

          {/* Report Hazard Global Shortcut */}
          <button
            onClick={() => setReportingHazardLocation(selectedLocation || locations[0])}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0F172A',
              color: '#F59E0B',
              border: '1px solid #475569',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.775rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Test Anti-Bias Hazard Validator"
            aria-label="Report a verifiable physical hazard"
          >
            <AlertTriangle size={14} />
            <span>Report Hazard</span>
          </button>
        </div>
      </header>

      {/* Top View Switcher (Consumer / CarPlay / B2B Operator / Enterprise API / Profile) */}
      <ViewSwitcher />

      {/* Main App Container */}
      <main style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '16px 20px' }} role="main">
        {/* Subterranean Concrete Offline Resiliency Banner */}
        <SubterraneanOfflineBanner />

        {/* Live Notification Toast */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid #22C55E',
              color: '#FFFFFF',
              padding: '10px 16px',
              borderRadius: '8px',
              marginBottom: '14px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={18} color="#22C55E" />
            {toastMessage}
          </div>
        )}

        {/* DYNAMIC VIEW ROUTING */}
        {currentView === 'driver' && (
          <div>
            <SearchAndFilterHeader />
            <LegalBanner />

            {/* Split View: Left Map Canvas, Right Spot Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(320px, 1.1fr)', gap: '18px' }}>
              {/* Interactive Map Column */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '1rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={16} color={SAFE_PARK_TOKENS.colors.brand.primary} />
                    City Risk & Lighting Grid Map
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: '#38BDF8' }}>
                    Interactive Live Telemetry
                  </span>
                </div>

                <InteractiveMapCanvas />

                {/* Selected Spot Fast Navigation Panel */}
                {selectedLocation && (
                  <div
                    style={{
                      backgroundColor: '#1E293B',
                      borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
                      border: '1px solid #334155',
                      padding: '14px 16px',
                      marginTop: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.725rem', color: '#94A3B8' }}>
                        {parkedLocation?.id === selectedLocation.id ? 'Your Stowed Vehicle Location:' : 'Selected Parking Target:'}
                      </div>
                      <div style={{ fontSize: '0.975rem', fontWeight: 600, color: '#FFFFFF' }}>
                        {selectedLocation.name}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setMotionState('walking');
                          setSafeWalkLocation(selectedLocation);
                        }}
                        style={{
                          backgroundColor: '#0F172A',
                          color: '#22C55E',
                          border: '1px solid #22C55E',
                          borderRadius: '6px',
                          padding: '7px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Footprints size={14} /> Safe Walk
                      </button>

                      <button
                        onClick={() => handleParkHere(selectedLocation)}
                        disabled={parkedLocation?.id === selectedLocation.id}
                        style={{
                          backgroundColor: parkedLocation?.id === selectedLocation.id ? '#22C55E' : SAFE_PARK_TOKENS.colors.brand.primary,
                          color: parkedLocation?.id === selectedLocation.id ? '#0F172A' : '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '7px 14px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: parkedLocation?.id === selectedLocation.id ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Car size={14} />
                        {parkedLocation?.id === selectedLocation.id ? 'Parked' : 'Park Here'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Parking Spots Risk List Column */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '1rem', color: '#FFFFFF' }}>
                    SafePark Intelligence Assessment ({locations.length} Spots)
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    Sorted by Safety Index (CSI)
                  </span>
                </div>

                <div style={{ maxHeight: '720px', overflowY: 'auto', paddingRight: '4px' }}>
                  {locations.length === 0 ? (
                    <div
                      style={{
                        backgroundColor: '#1E293B',
                        borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
                        padding: '32px',
                        textAlign: 'center',
                        color: '#94A3B8',
                      }}
                    >
                      <p>No parking locations match your active filter criteria.</p>
                      <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>Try lowering the minimum CSI threshold or clearing filters.</p>
                    </div>
                  ) : (
                    locations.map((loc) => (
                      <SpotCard
                        key={loc.id}
                        location={loc}
                        isSelected={selectedLocation?.id === loc.id}
                        isParkedHere={parkedLocation?.id === loc.id}
                        onSelect={(l) => setSelectedLocation(l)}
                        onInspectCsi={(l) => setInspectingCsiLocation(l)}
                        onSafeWalk={(l) => {
                          setSelectedLocation(l);
                          setSafeWalkLocation(l);
                        }}
                        onParkHere={(l) => handleParkHere(l)}
                        onReportHazard={(l) => setReportingHazardLocation(l)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'carplay' && <CarPlayView />}
        {currentView === 'b2b_portal' && <GarageOperatorPortal />}
        {currentView === 'enterprise_api' && <EnterpriseApiDashboard />}
        {currentView === 'user_profile' && <UserProfileView />}
        {currentView === 'admin_ops' && <AdminOpsDashboard />}
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: '#1E293B',
          borderTop: '1px solid #334155',
          padding: '16px 20px',
          fontSize: '0.75rem',
          color: '#94A3B8',
          textAlign: 'center',
          marginTop: '24px',
        }}
        role="contentinfo"
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong>SafePark Inc.</strong> &copy; {new Date().getFullYear()} — Context-Aware Parking Intelligence & Property Risk Mitigation.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Clean Architecture</span>
            <span>•</span>
            <span>WCAG 2.1 AA Compliant</span>
            <span>•</span>
            <span>Anti-Bias Verified</span>
          </div>
        </div>
      </footer>

      {/* Interactive Guided Demo Tour Overlay */}
      <DemoTour
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
      />

      {/* Modals & Dialogs */}
      {isOnboardingOpen && (
        <OnboardingModal onComplete={() => setIsOnboardingOpen(false)} />
      )}

      {isStripeCheckoutOpen && (
        <StripeCheckoutModal
          isOpen={isStripeCheckoutOpen}
          onClose={() => setIsStripeCheckoutOpen(false)}
        />
      )}

      {inspectingCsiLocation && (
        <CsiBreakdownModal
          location={inspectingCsiLocation}
          onClose={() => setInspectingCsiLocation(null)}
        />
      )}

      {reportingHazardLocation && (
        <HazardSubmissionModal
          location={reportingHazardLocation}
          onClose={() => setReportingHazardLocation(null)}
          onSubmitSuccess={handleHazardSubmitted}
        />
      )}

      {safeWalkLocation && (
        <SafeWalkModal
          location={safeWalkLocation}
          onClose={() => setSafeWalkLocation(null)}
        />
      )}

      {activeExitAlert && (
        <ExitAlertModal
          alert={activeExitAlert}
          onClose={() => setActiveExitAlert(null)}
          onConfirmCabinClear={() => {
            showToast('🔒 Cabin check confirmed. Safe walk route available.');
          }}
        />
      )}
    </div>
  );
};
