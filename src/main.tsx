import React from 'react';
import ReactDOM from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './index.css';
import { ThemeProvider } from './theme/ThemeProvider';
import { AppProvider } from './presentation/context/AppContext';
import { VehicleProvider } from './context/VehicleContext';
import App from './App';
import { registerServiceWorker } from './utils/swRegistration';
import { Telemetry } from './utils/telemetry';

// Initialize Sentry and Crash Reporting Telemetry
Telemetry.init();

// Register PWA service worker
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppProvider>
        <VehicleProvider>
          <App />
        </VehicleProvider>
      </AppProvider>
    </ThemeProvider>
  </React.StrictMode>
);
