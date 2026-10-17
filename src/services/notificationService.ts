/**
 * SafePark Meter Expiration Notification Service
 * Handles browser notification permissions, 15-minute countdown alerts,
 * and service worker push triggers.
 */

export class NotificationService {
  private static alertTimeoutId: NodeJS.Timeout | null = null;

  /**
   * Request native browser notification permission
   */
  public static async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      if (Notification.permission === 'default') {
        return await Notification.requestPermission();
      }
      return Notification.permission;
    } catch (err) {
      console.warn('Failed to request notification permission:', err);
      return 'denied';
    }
  }

  /**
   * Trigger an immediate meter expiration alert
   */
  public static triggerMeterAlert(locationName: string): void {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission !== 'granted') {
      return;
    }

    const title = '⚠️ 15 Minutes Left on Meter';
    const body = `Your vehicle at ${locationName} will exceed the meter limit shortly. Return to your car to avoid a parking ticket.`;
    const icon = '/favicon.svg';

    // Attempt via Service Worker registration if available, fallback to new Notification
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification(title, {
            body,
            icon,
            badge: '/favicon.svg',
            tag: 'safepark-meter-15min-alert',
            renotify: true,
            requireInteraction: true,
            data: { url: '/?tab=my_car' },
          } as any).catch(() => {
            this.fallbackNotification(title, body, icon);
          });
        })
        .catch(() => {
          this.fallbackNotification(title, body, icon);
        });
    } else {
      this.fallbackNotification(title, body, icon);
    }
  }

  private static fallbackNotification(title: string, body: string, icon: string): void {
    try {
      new Notification(title, {
        body,
        icon,
        tag: 'safepark-meter-15min-alert',
      });
    } catch (err) {
      console.warn('Fallback notification trigger failed:', err);
    }
  }

  /**
   * Schedule a notification when 15 minutes remain on the meter session
   * @param parkedAt Timestamp (ms) when vehicle was parked
   * @param durationMinutes Total meter duration in minutes
   * @param locationName Formatted spot or block name
   */
  public static scheduleMeterAlert(
    parkedAt: number,
    durationMinutes: number,
    locationName: string
  ): void {
    // Clear any existing scheduled alert
    this.cancelScheduledAlert();

    // "All Day" parking or no limit does not trigger a 15m expiration alarm
    if (durationMinutes >= 720) {
      return;
    }

    const durationMs = durationMinutes * 60 * 1000;
    const alertTimestamp = parkedAt + durationMs - 15 * 60 * 1000;
    const now = Date.now();
    const delayMs = alertTimestamp - now;

    if (delayMs <= 0) {
      // If duration is <= 15 minutes or remaining time is already under 15m, trigger immediately
      const expiresAt = parkedAt + durationMs;
      if (now < expiresAt) {
        this.alertTimeoutId = setTimeout(() => {
          this.triggerMeterAlert(locationName);
        }, 800);
      }
    } else {
      // Schedule alert when exactly 15 minutes remain
      this.alertTimeoutId = setTimeout(() => {
        this.triggerMeterAlert(locationName);
      }, delayMs);
    }
  }

  /**
   * Cancel any pending scheduled notification
   */
  public static cancelScheduledAlert(): void {
    if (this.alertTimeoutId) {
      clearTimeout(this.alertTimeoutId);
      this.alertTimeoutId = null;
    }
  }
}
