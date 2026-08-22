import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './theme/ThemeProvider';
import { AppProvider } from './presentation/context/AppContext';
import { App } from './presentation/App';
import { registerServiceWorker } from './utils/swRegistration';
import { Telemetry } from './utils/telemetry';
import './theme/theme.css';

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
