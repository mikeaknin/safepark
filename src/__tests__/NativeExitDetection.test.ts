import { describe, it, expect } from 'vitest';
import { NativeExitDetection, NativeExitEvent } from '../services/native/NativeExitDetection';

describe('NativeExitDetection Service', () => {
  it('should initialize background monitoring with custom bluetooth device name', async () => {
    const initialized = await NativeExitDetection.initializeBackgroundMonitoring('Tesla_Model_Y_BT');
    expect(initialized).toBe(true);
    expect(NativeExitDetection.getIsMonitoring()).toBe(true);
    expect(NativeExitDetection.getBluetoothStatus().deviceName).toBe('Tesla_Model_Y_BT');
  });

  it('should fire vehicle exit event with High Risk warnings when CSI < 50', async () => {
    let capturedEvent: NativeExitEvent | null = null;
    const unsub = NativeExitDetection.subscribe((event: NativeExitEvent) => {
      capturedEvent = event;
    });

    const event = await NativeExitDetection.triggerVehicleExit(
      'Tenderloin Curbside Unmetered Stall',
      38, // High Risk
      { lat: 37.7833, lng: -122.4167 }
    );

    expect(event.riskLevel).toBe('HIGH');
    expect(event.csiScoreAtExit).toBe(38);
    expect(event.triggerType).toBe('bluetooth_disconnect');
    expect(event.alertDelivered).toBe(true);
    expect(capturedEvent).not.toBeNull();
    expect((capturedEvent as NativeExitEvent | null)?.riskLevel).toBe('HIGH');

    unsub();
  });

  it('should fire vehicle exit event with Low Risk assessment when CSI >= 75', async () => {
    const event = await NativeExitDetection.triggerVehicleExit(
      'Mission Bay Secure Underground Structure',
      92, // Low Risk
      { lat: 37.7785, lng: -122.395 }
    );

    expect(event.riskLevel).toBe('LOW');
    expect(event.csiScoreAtExit).toBe(92);
    expect(event.alertDelivered).toBe(true);
  });
});
