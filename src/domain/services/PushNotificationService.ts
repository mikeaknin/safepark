import { ExitTriggerAlert } from './ExitDetectionService';

export class PushNotificationService {
  private static permissionGranted: boolean = false;

  public static async requestPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        this.permissionGranted = perm === 'granted';
        return this.permissionGranted;
      } catch (e) {
        console.warn('Push notification permission request failed:', e);
      }
    }
    return false;
  }

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Dispatches a native device notification upon vehicle exit detection
   */
  public static async dispatchVehicleExitPush(alert: ExitTriggerAlert): Promise<void> {
    if (typeof window === 'undefined') return;

    // Check if browser native notification is permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title: alert.title,
            body: alert.message,
            icon: '/manifest.json',
          });
        } else {
          new Notification(alert.title, {
            body: alert.message,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%232C73D2"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>',
            tag: 'safepark-exit-alert',
          });
        }
      } catch (e) {
        console.warn('Native notification dispatch failed:', e);
      }
    }
  }
}
