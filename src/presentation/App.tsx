import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { SAFE_PARK_TOKENS } from '../theme/tokens';
import { BottomNavBar } from './components/common/BottomNavBar';
import { LabToolsModal } from './components/common/LabToolsModal';
import { SubterraneanOfflineBanner } from './components/common/SubterraneanOfflineBanner';
import { SearchAndFilterHeader } from './components/search/SearchAndFilterHeader';
import { InteractiveMapCanvas } from './components/map/InteractiveMapCanvas';
import { MobileBottomSheet } from './components/mobile/MobileBottomSheet';
import { CsiBreakdownModal } from './components/scoring/CsiBreakdownModal';
import { HazardSubmissionModal } from './components/reporting/HazardSubmissionModal';
import { SafeWalkModal } from './components/navigation/SafeWalkModal';
import { ExitAlertModal } from './components/triggers/ExitAlertModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { DemoTour } from './components/demo/DemoTour';
import { StripeCheckoutModal } from './components/monetization/StripeCheckoutModal';
import { GarageOperatorPortal } from './views/GarageOperatorPortal';
import { CarPlayView } from './views/CarPlayView';
import { EnterpriseApiDashboard } from './views/EnterpriseApiDashboard';
import { UserProfileView } from './views/UserProfileView';
import { AdminOpsDashboard } from './views/AdminOpsDashboard';
import { CheckCircle2, Shield, FlaskConical } from 'lucide-react';

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
  const [isLabToolsOpen, setIsLabToolsOpen] = useState<boolean>(false);

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Hidden ARIA Live Announcer for Screen Readers */}
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          border: 0,
        }}
      >
        {toastMessage}
      </div>

      {/* DRIVER EXPLORE MAP VIEW (Mobile-First Fullscreen Canvas + Bottom Sheet) */}
      {currentView === 'driver' && (
        <div style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden' }}>
          {/* Edge-to-Edge Fullscreen Interactive Vector Map */}
          <InteractiveMapCanvas isFullscreen={true} />

          {/* Floating Top Search & Quick Filter Overlay */}
          <SearchAndFilterHeader onOpenLabTools={() => setIsLabToolsOpen(true)} />

          {/* Subterranean Signal Loss Banner Overlay */}
          <div
            style={{
              position: 'fixed',
              top: 'calc(env(safe-area-inset-top, 0px) + 105px)',
              left: '14px',
              right: '14px',
              zIndex: 25,
            }}
          >
            <SubterraneanOfflineBanner />
          </div>

          {/* Live Notification Toast */}
          {toastMessage && (
            <div
              role="status"
              aria-live="polite"
              style={{
                position: 'fixed',
                top: 'calc(env(safe-area-inset-top, 0px) + 120px)',
                left: '14px',
                right: '14px',
                zIndex: 35,
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid #22C55E',
                color: '#FFFFFF',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <CheckCircle2 size={18} color="#22C55E" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* iOS-Style Draggable Bottom Sheet */}
          <MobileBottomSheet
            onInspectCsi={(loc) => setInspectingCsiLocation(loc)}
            onSafeWalk={(loc) => {
              setSelectedLocation(loc);
              setSafeWalkLocation(loc);
            }}
            onReportHazard={(loc) => setReportingHazardLocation(loc)}
          />
        </div>
      )}

      {/* FULL PAGE NON-MAP APPLICATION VIEWS */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: SAFE_PARK_TOKENS.colors.brand.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield size={18} color="#FFFFFF" />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>SafePark</span>
            </div>

            <button
              onClick={() => setIsLabToolsOpen(true)}
              style={{
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38BDF8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Lab Tools
            </button>
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

      {/* Simulation & Lab Tools Drawer Modal */}
      <LabToolsModal
        isOpen={isLabToolsOpen}
        onClose={() => setIsLabToolsOpen(false)}
        onOpenDemoTour={() => setIsDemoTourOpen(true)}
      />

      {/* Interactive Guided Demo Tour Overlay */}
      <DemoTour isOpen={isDemoTourOpen} onClose={() => setIsDemoTourOpen(false)} />

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
