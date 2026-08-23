import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { BottomNavBar } from './components/common/BottomNavBar';
import { SubterraneanOfflineBanner } from './components/common/SubterraneanOfflineBanner';
import { SearchAndFilterHeader } from './components/search/SearchAndFilterHeader';
import { InteractiveMapCanvas } from './components/map/InteractiveMapCanvas';
import { AppleMapsBottomSheet } from './components/AppleMapsBottomSheet';
import { CsiBreakdownModal } from './components/scoring/CsiBreakdownModal';
import { HazardSubmissionModal } from './components/reporting/HazardSubmissionModal';
import { SafeWalkModal } from './components/navigation/SafeWalkModal';
import { DirectionsActionSheet } from './components/navigation/DirectionsActionSheet';
import { ExitAlertModal } from './components/triggers/ExitAlertModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { StripeCheckoutModal } from './components/monetization/StripeCheckoutModal';
import { SafeGaragesView } from './views/SafeGaragesView';
import { UserProfileView } from './views/UserProfileView';
import { MyCarView } from './views/MyCarView';
import { SafeParkLogo } from './components/SafeParkLogo';
import { ParkingLocation } from '../domain/models/ParkingLocation';

export const App: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isOnboardingOpen,
    setIsOnboardingOpen,
    isStripeCheckoutOpen,
    setIsStripeCheckoutOpen,
    inspectingCsiLocation,
    setInspectingCsiLocation,
    reportingHazardLocation,
    setReportingHazardLocation,
    safeWalkLocation,
    setSafeWalkLocation,
    activeExitAlert,
    setActiveExitAlert,
    handleHazardSubmitted,
    toastMessage,
    showToast,
  } = useApp();

  const [directionsLocation, setDirectionsLocation] = useState<ParkingLocation | null>(null);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100dvh',
        backgroundColor: '#F8FAFC',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Dynamic Toast Feedback Overlay */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 76px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            border: '1.5px solid #15803D',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
            borderRadius: '24px',
            padding: '8px 18px',
            fontSize: '0.825rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'none',
          }}
        >
          {toastMessage}
        </aside>
      )}

      {/* Subterranean Garage Concrete Shield Banner */}
      <SubterraneanOfflineBanner />

      {/* 1. Explore Fullscreen Map Viewport */}
      {currentView === 'driver' && (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
          <InteractiveMapCanvas isFullscreen={true} />

          <SearchAndFilterHeader />

          <AppleMapsBottomSheet
            onInspectCsi={(loc) => setInspectingCsiLocation(loc)}
            onSafeWalk={(loc) => setSafeWalkLocation(loc)}
            onReportHazard={(loc) => setReportingHazardLocation(loc)}
            onOpenDirections={(loc) => setDirectionsLocation(loc)}
          />
        </div>
      )}

      {/* 2. Secondary Consumer Views (Safe Garages & Profile) */}
      {currentView !== 'driver' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            backgroundColor: '#F8FAFC',
          }}
        >
          {/* Mobile Top Brand Header */}
          <header
            style={{
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid #E2E8F0',
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
              paddingBottom: '10px',
              paddingLeft: '16px',
              paddingRight: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              zIndex: 30,
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
              minHeight: '56px',
            }}
          >
            <SafeParkLogo size={36} showText={true} />
          </header>

          <main style={{ flex: 1, width: '100%', margin: '0 auto' }}>
            {currentView === 'my_car' && (
              <MyCarView onNavigateToExplore={() => setCurrentView('driver')} />
            )}
            {(currentView === 'safe_garages' || currentView === 'b2b_portal') && <SafeGaragesView />}
            {(currentView === 'profile' || currentView === 'user_profile') && <UserProfileView />}
          </main>
        </div>
      )}

      {/* Fixed Bottom Tab Navigation Bar */}
      <BottomNavBar />

      {/* Modals & Dialogs */}
      {isOnboardingOpen && <OnboardingModal onComplete={() => setIsOnboardingOpen(false)} />}

      {isStripeCheckoutOpen && (
        <StripeCheckoutModal
          isOpen={isStripeCheckoutOpen}
          onClose={() => setIsStripeCheckoutOpen(false)}
        />
      )}

      {directionsLocation && (
        <DirectionsActionSheet
          location={directionsLocation}
          isOpen={!!directionsLocation}
          onClose={() => setDirectionsLocation(null)}
          onCopyAddress={() => showToast('📋 Facility address copied')}
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
        <SafeWalkModal location={safeWalkLocation} onClose={() => setSafeWalkLocation(null)} />
      )}

      {activeExitAlert && (
        <ExitAlertModal
          alert={activeExitAlert}
          onClose={() => setActiveExitAlert(null)}
          onConfirmCabinClear={() => {
            setActiveExitAlert(null);
            showToast('✓ Vehicle cabin verified clear.');
          }}
        />
      )}
    </div>
  );
};
