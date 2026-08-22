import React, { ReactNode } from 'react';

interface MainLayoutProps {
  header?: ReactNode;
  mapCanvas?: ReactNode;
  bottomSheet?: ReactNode;
  bottomNav?: ReactNode;
  labToolsDrawer?: ReactNode;
  modals?: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  header,
  mapCanvas,
  bottomSheet,
  bottomNav,
  labToolsDrawer,
  modals,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        backgroundColor: '#0F172A',
      }}
    >
      {/* Fullscreen Vector Map Canvas */}
      {mapCanvas}

      {/* Floating Glassmorphic Top Header */}
      {header}

      {/* Tri-Modal Bottom Sheet */}
      {bottomSheet}

      {/* Fixed Bottom Navigation Bar */}
      {bottomNav}

      {/* Slide-Over Simulation Lab Tools Drawer */}
      {labToolsDrawer}

      {/* Overlays / Modals */}
      {modals}
    </div>
  );
};
