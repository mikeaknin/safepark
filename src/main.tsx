import React from 'react';
import ReactDOM from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './index.css';
import './theme/theme.css';
import { ThemeProvider } from './theme/ThemeProvider';
import { AppProvider } from './presentation/context/AppContext';
import { App } from './presentation/App';
import { registerServiceWorker } from './utils/swRegistration';
import { Telemetry } from './utils/telemetry';

// Unregister stale service workers to ensure clients always fetch the latest bundle
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

// Initialize Sentry and Crash Reporting Telemetry
Telemetry.init();

// Register PWA service worker
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </ThemeProvider>
  </React.StrictMode>
);
