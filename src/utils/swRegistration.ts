/// <reference types="vite/client" />

export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('SafePark Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('SafePark Service Worker registration failed:', err);
        });
    });
  }
}
