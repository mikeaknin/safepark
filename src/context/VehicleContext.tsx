import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface ActiveVehicleState {
  spotId: string;
  name: string;
  lat: number;
  lon: number;
  parkedAt: number;
  meterDurationMinutes: number;
  blockType: string;
  streetSweepingNotice?: string;
  csiScore?: number;
  address?: string;
  notes?: {
    level?: string;
    stallNumber?: string;
    note?: string;
  };
}

export interface VehicleContextType {
  activeVehicle: ActiveVehicleState | null;
  parkVehicle: (
    spot: {
      id: string;
      name: string;
      lat: number;
      lon: number;
      blockType?: string;
      structureType?: string;
      address?: string;
      csiScore?: number;
      streetSweepingNotice?: string;
    },
    durationMinutes?: number,
    notes?: { level?: string; stallNumber?: string; note?: string }
  ) => void;
  endParkingSession: () => void;
  updateNotes: (notes: { level?: string; stallNumber?: string; note?: string }) => void;
  remainingMinutes: number;
  remainingSeconds: number;
  totalDurationMinutes: number;
  progressPercent: number; // 0 to 100 for circular countdown ring
  isExpired: boolean;
  isWarning: boolean;
  remainingTimeFormatted: string;
}

const STORAGE_KEY = 'safepark_vehicle_state';
const LEGACY_STORAGE_KEY = 'safepark_active_session_v1';

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeVehicle, setActiveVehicle] = useState<ActiveVehicleState | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Check legacy key fallback
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        return {
          spotId: parsed.locationId || parsed.id,
          name: parsed.spotName || parsed.name,
          lat: parsed.coordinates?.lat || parsed.lat,
          lon: parsed.coordinates?.lng || parsed.lon,
          parkedAt: parsed.parkedAtTimestamp || parsed.parkedAt || Date.now(),
          meterDurationMinutes: Math.round(
            ((parsed.expirationTimestamp || Date.now() + 120 * 60 * 1000) -
              (parsed.parkedAtTimestamp || Date.now())) /
              (60 * 1000)
          ) || 120,
          blockType: parsed.spotType || 'curbside_street_metered',
          streetSweepingNotice: parsed.streetSweepingNotice,
          csiScore: parsed.csiScore,
          address: parsed.address,
          notes: parsed.garageNotes,
        };
      }
    } catch {
      return null;
    }
    return null;
  });

  const [remainingMinutes, setRemainingMinutes] = useState<number>(120);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(100);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isWarning, setIsWarning] = useState<boolean>(false);
  const [remainingTimeFormatted, setRemainingTimeFormatted] = useState<string>('2h 00m');

  // Live timer tick
  useEffect(() => {
    if (!activeVehicle) {
      setRemainingMinutes(0);
      setRemainingSeconds(0);
      setProgressPercent(100);
      setIsExpired(false);
      setIsWarning(false);
      setRemainingTimeFormatted('No Active Session');
      return;
    }

    const calculateTimer = () => {
      const now = Date.now();
      const expiresAt = activeVehicle.parkedAt + activeVehicle.meterDurationMinutes * 60 * 1000;
      const diffMs = expiresAt - now;
      const totalDurationMs = activeVehicle.meterDurationMinutes * 60 * 1000;

      if (diffMs <= 0) {
        const overMinutes = Math.floor(Math.abs(diffMs) / (60 * 1000));
        setIsExpired(true);
        setIsWarning(true);
        setRemainingMinutes(0);
        setRemainingSeconds(0);
        setProgressPercent(0);
        setRemainingTimeFormatted(`Expired ${overMinutes}m ago`);
      } else {
        setIsExpired(false);
        const mins = Math.floor(diffMs / (60 * 1000));
        const secs = Math.floor((diffMs % (60 * 1000)) / 1000);
        setRemainingMinutes(mins);
        setRemainingSeconds(secs);

        const hours = Math.floor(mins / 60);
        const displayMins = mins % 60;

        setIsWarning(mins <= 15);
        const percent = Math.max(0, Math.min(100, (diffMs / totalDurationMs) * 100));
        setProgressPercent(percent);

        if (hours > 0) {
          setRemainingTimeFormatted(`${hours}h ${displayMins < 10 ? `0${displayMins}` : displayMins}m`);
        } else {
          setRemainingTimeFormatted(`${mins}m ${secs < 10 ? `0${secs}` : secs}s`);
        }
      }
    };

    calculateTimer();
    const interval = setInterval(calculateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeVehicle]);

  const parkVehicle = useCallback(
    (
      spot: {
        id: string;
        name: string;
        lat: number;
        lon: number;
        blockType?: string;
        structureType?: string;
        address?: string;
        csiScore?: number;
        streetSweepingNotice?: string;
      },
      durationMinutes: number = 120,
      notes?: { level?: string; stallNumber?: string; note?: string }
    ) => {
      // Safe haptic feedback check
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(15);
        } catch {}
      }

      const blockType = spot.blockType || spot.structureType || 'curbside_street_metered';
      const sweeping =
        spot.streetSweepingNotice ||
        (blockType.includes('curbside') || blockType.includes('street')
          ? 'Tue 2:00 AM - 6:00 AM'
          : undefined);

      const newVehicle: ActiveVehicleState = {
        spotId: spot.id,
        name: spot.name,
        lat: spot.lat,
        lon: spot.lon,
        parkedAt: Date.now(),
        meterDurationMinutes: durationMinutes,
        blockType,
        streetSweepingNotice: sweeping,
        csiScore: spot.csiScore || 85,
        address: spot.address || `${spot.name}, CA`,
        notes,
      };

      setActiveVehicle(newVehicle);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newVehicle));
        // Legacy sync
        localStorage.setItem(
          LEGACY_STORAGE_KEY,
          JSON.stringify({
            id: `session_${newVehicle.parkedAt}`,
            locationId: newVehicle.spotId,
            spotName: newVehicle.name,
            address: newVehicle.address,
            spotType: newVehicle.blockType,
            coordinates: { lat: newVehicle.lat, lng: newVehicle.lon },
            parkedAtTimestamp: newVehicle.parkedAt,
            expirationTimestamp: newVehicle.parkedAt + durationMinutes * 60 * 1000,
            csiScore: newVehicle.csiScore,
            streetSweepingNotice: newVehicle.streetSweepingNotice,
            garageNotes: notes,
          })
        );
      } catch {}
    },
    []
  );

  const endParkingSession = useCallback(() => {
    // Safe haptic feedback check
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {}
    }

    setActiveVehicle(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {}
  }, []);

  const updateNotes = useCallback((notes: { level?: string; stallNumber?: string; note?: string }) => {
    setActiveVehicle((prev) => {
      if (!prev) return null;
      const updated = { ...prev, notes };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const value: VehicleContextType = {
    activeVehicle,
    parkVehicle,
    endParkingSession,
    updateNotes,
    remainingMinutes,
    remainingSeconds,
    totalDurationMinutes: activeVehicle?.meterDurationMinutes || 120,
    progressPercent,
    isExpired,
    isWarning,
    remainingTimeFormatted,
  };

  return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>;
};

export const useVehicle = (): VehicleContextType => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
};
