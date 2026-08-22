import React from 'react';
import { useApp } from './context/AppContext';
import { BottomNavBar } from './components/common/BottomNavBar';
import { SubterraneanOfflineBanner } from './components/common/SubterraneanOfflineBanner';
import { SearchAndFilterHeader } from './components/search/SearchAndFilterHeader';
import { InteractiveMapCanvas } from './components/map/InteractiveMapCanvas';
import { AppleMapsBottomSheet } from './components/AppleMapsBottomSheet';
import { CsiBreakdownModal } from './components/scoring/CsiBreakdownModal';
import { HazardSubmissionModal } from './components/reporting/HazardSubmissionModal';
import { SafeWalkModal } from './components/navigation/SafeWalkModal';
import { ExitAlertModal } from './components/triggers/ExitAlertModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { StripeCheckoutModal } from './components/monetization/StripeCheckoutModal';
import { GarageOperatorPortal } from './views/GarageOperatorPortal';
import { CarPlayView } from './views/CarPlayView';
import { EnterpriseApiDashboard } from './views/EnterpriseApiDashboard';
import { UserProfileView } from './views/UserProfileView';
import { AdminOpsDashboard } from './views/AdminOpsDashboard';
import { SafeParkLogo } from './components/SafeParkLogo';

export const App: React.FC = () => {
  const {
    currentView,
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

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100dvh',
        backgroundColor: '#0F172A',
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
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            border: '1.5px solid #22C55E',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
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

      {/* Primary Consumer Driver Experience (100% Fullscreen Map Viewport) */}
      {currentView === 'driver' && (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
          {/* 100% Mobile Fullscreen Vector Leaflet/Canvas Base */}
          <InteractiveMapCanvas isFullscreen={true} />

          {/* Clean Floating Apple Maps Search Header */}
          <SearchAndFilterHeader />

          {/* Tri-Modal Apple Maps Bottom Sheet */}
          <AppleMapsBottomSheet
            onInspectCsi={(loc) => setInspectingCsiLocation(loc)}
            onSafeWalk={(loc) => setSafeWalkLocation(loc)}
            onReportHazard={(loc) => setReportingHazardLocation(loc)}
          />
        </div>
      )}

      {/* Secondary Desktop / Multi-Sided Navigation Views */}
      {currentView !== 'driver' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 70px)',
            overflowY: 'auto',
          }}
        >
          {/* Top Bar for Secondary Views */}
          <header
            style={{
              backgroundColor: '#1E293B',
              borderBottom: '1px solid #334155',
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
              paddingBottom: '12px',
              paddingLeft: '16px',
              paddingRight: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              zIndex: 30,
            }}
          >
            <SafeParkLogo size={32} showText={true} />
          </header>

          <main style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '16px' }}>
            {currentView === 'carplay' && <CarPlayView />}
            {currentView === 'b2b_portal' && <GarageOperatorPortal />}
            {currentView === 'enterprise_api' && <EnterpriseApiDashboard />}
            {currentView === 'user_profile' && <UserProfileView />}
            {currentView === 'admin_ops' && <AdminOpsDashboard />}
          </main>
        </div>
      )}

      {/* iOS-Style Fixed Bottom Tab Navigation Bar */}
      <BottomNavBar />

      {/* Modals & Dialogs */}
      {isOnboardingOpen && <OnboardingModal onComplete={() => setIsOnboardingOpen(false)} />}

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
        <SafeWalkModal location={safeWalkLocation} onClose={() => setSafeWalkLocation(null)} />
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
