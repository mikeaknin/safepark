import { ParkingLocation } from '../models/ParkingLocation';

export interface ExitTriggerAlert {
  id: string;
  spotId: string;
  triggerType: 'bluetooth_disconnect' | 'motion_transition' | 'geofence_exit_step';
  timestamp: string;
  title: string;
  message: string;
  urgency: 'high' | 'medium' | 'standard';
  actionPrompt: string;
  smashAndGrabRiskCount: number;
}

export type ExitDetectionListener = (alert: ExitTriggerAlert) => void;

export class ExitDetectionService {
  private static listeners: ExitDetectionListener[] = [];
  private static isMonitoring: boolean = false;
  private static connectedBluetoothDevice: string | null = 'CarPlay_Vehicle_Audio_Sync';

  public static subscribe(listener: ExitDetectionListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public static startMonitoring(): void {
    this.isMonitoring = true;
  }

  public static stopMonitoring(): void {
    this.isMonitoring = false;
  }

  /**
   * Simulates a Bluetooth disconnect event when driver turns off engine or uncouples car audio.
   */
  public static triggerBluetoothDisconnect(location: ParkingLocation): ExitTriggerAlert {
    this.connectedBluetoothDevice = null;
    return this.generateExitAlert(location, 'bluetooth_disconnect');
  }

  /**
   * Simulates motion state transition (driving -> walking exit detected).
   */
  public static triggerMotionTransition(location: ParkingLocation): ExitTriggerAlert {
    return this.generateExitAlert(location, 'motion_transition');
  }

  private static generateExitAlert(
    location: ParkingLocation,
    triggerType: 'bluetooth_disconnect' | 'motion_transition' | 'geofence_exit_step'
  ): ExitTriggerAlert {
    const sngCount = location.crimeData.smashAndGrabCount;
    const isNight = !location.lighting.isDaytime;
    
    let title = 'Vehicle Exit Detected: SafePark Alert';
    let message = 'Please double check that your doors are locked and windows rolled up.';
    let urgency: 'high' | 'medium' | 'standard' = 'standard';
    let actionPrompt = 'Confirm Locked';

    if (sngCount > 1 || location.csi.totalScore < 50) {
      urgency = 'high';
      title = '⚠️ High Smash-and-Grab Advisory';
      message = `This block recorded ${sngCount} window break-in(s) recently. DO NOT leave charging cables, backpacks, jackets, or sunglasses in plain view. Conceal all items in the trunk before walking away.`;
      actionPrompt = 'Valuables Stowed in Trunk';
    } else if (sngCount === 1 || isNight) {
      urgency = 'medium';
      title = '💡 Post-Parking Property Check';
      message = 'Store dash accessories and electronic charging cords out of plain sight. Well-lit pedestrian path active on map.';
      actionPrompt = 'Cabin Clear';
    }

    const alert: ExitTriggerAlert = {
      id: `alert-exit-${Date.now()}`,
      spotId: location.id,
      triggerType,
      timestamp: new Date().toLocaleTimeString(),
      title,
      message,
      urgency,
      actionPrompt,
      smashAndGrabRiskCount: sngCount,
    };

    this.listeners.forEach(fn => fn(alert));
    return alert;
  }
}
