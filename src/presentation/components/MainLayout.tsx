import React, { ReactNode } from 'react';

interface MainLayoutProps {
  header?: ReactNode;
  mapCanvas?: ReactNode;
  bottomSheet?: ReactNode;
  bottomNav?: ReactNode;
  modals?: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  header,
  mapCanvas,
  bottomSheet,
  bottomNav,
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

      {/* Overlays / Modals */}
      {modals}
    </div>
  );
};
