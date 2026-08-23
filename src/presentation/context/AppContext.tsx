import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { ParkingLocation } from '../../domain/models/ParkingLocation';
import { SafetyRepositoryImpl } from '../../data/repositories/SafetyRepositoryImpl';
import { ParkingRepositoryImpl } from '../../data/repositories/ParkingRepositoryImpl';
import { HazardRepositoryImpl } from '../../data/repositories/HazardRepositoryImpl';
import { ExitDetectionService, ExitTriggerAlert } from '../../domain/services/ExitDetectionService';
import { OfflineCacheService } from '../../domain/services/OfflineCacheService';
import { HazardValidationResult } from '../../domain/models/HazardReport';
import { CsiEngine } from '../../domain/services/CsiEngine';
import { AuthService, AuthUser } from '../../domain/services/AuthService';
import { PushNotificationService } from '../../domain/services/PushNotificationService';
import { GeocodingAdapter } from '../../data/adapters/GeocodingAdapter';
import { DynamicParkingGenerator } from '../../domain/services/DynamicParkingGenerator';
import { SavedParkingSession } from '../../domain/models/SavedParkingSession';

export type ActiveAppView = 'driver' | 'safe_garages' | 'profile' | 'carplay' | 'b2b_portal' | 'enterprise_api' | 'user_profile' | 'admin_ops';
export type MotionState = 'driving' | 'parked' | 'walking';

export interface SearchDestination {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
}

export const POPULAR_DESTINATIONS: SearchDestination[] = [
  { id: 'dest-1', name: 'Moscone Convention Center', address: '747 Howard St, San Francisco, CA', coordinates: { lat: 37.7842, lng: -122.4015 } },
  { id: 'dest-2', name: 'Salesforce Tower Plaza', address: '415 Mission St, San Francisco, CA', coordinates: { lat: 37.7897, lng: -122.3972 } },
  { id: 'dest-3', name: 'Union Square & Shopping District', address: '333 Post St, San Francisco, CA', coordinates: { lat: 37.7879, lng: -122.4075 } },
  { id: 'dest-4', name: 'Oracle Park', address: '24 Willie Mays Plaza, San Francisco, CA', coordinates: { lat: 37.7786, lng: -122.3893 } },
  { id: 'dest-5', name: 'Metreon Entertainment Hub', address: '135 4th St, San Francisco, CA', coordinates: { lat: 37.7848, lng: -122.4032 } },
];

export interface FilterSettings {
  minCsi: number;
  maxHourlyRate: number;
  coveredOrGarageOnly: boolean;
  gatedAccessOnly: boolean;
  monitoredCctvOnly: boolean;
  parkingTypeFilter: 'all' | 'street_only' | 'garages_only';
}

interface AppContextType {
  // Navigation & Multi-Sided View Switching
  currentView: ActiveAppView;
  setCurrentView: (view: ActiveAppView) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;

  // Authentication & Driver Profile
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
  isStripeCheckoutOpen: boolean;
  setIsStripeCheckoutOpen: (open: boolean) => void;

  // Data Repositories
  safetyRepo: SafetyRepositoryImpl;
  parkingRepo: ParkingRepositoryImpl;
  hazardRepo: HazardRepositoryImpl;

  // Locations & Selection
  locations: ParkingLocation[];
  selectedLocation: ParkingLocation | null;
  setSelectedLocation: (loc: ParkingLocation | null) => void;
  refreshLocations: () => Promise<void>;
  scanLocationsAt: (coords: { lat: number; lng: number }, areaName?: string) => Promise<void>;

  // Search & Destination
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDestination: SearchDestination | null;
  setSelectedDestination: (dest: SearchDestination | null) => void;
  destinationResults: SearchDestination[];

  // Filters
  filters: FilterSettings;
  setFilters: React.Dispatch<React.SetStateAction<FilterSettings>>;
  resetFilters: () => void;
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: (open: boolean) => void;

  // Map Display Layers
  showLightingHeatmap: boolean;
  setShowLightingHeatmap: React.Dispatch<React.SetStateAction<boolean>>;
  showFootTrafficZones: boolean;
  setShowFootTrafficZones: React.Dispatch<React.SetStateAction<boolean>>;

  // Environment Simulation State
  isNightMode: boolean;
  setIsNightMode: React.Dispatch<React.SetStateAction<boolean>>;
  motionState: MotionState;
  setMotionState: (state: MotionState) => void;
  parkedLocation: ParkingLocation | null;
  activeParkedSession: SavedParkingSession | null;
  bluetoothConnected: boolean;
  toggleBluetooth: () => void;

  // Modals & Triggers
  inspectingCsiLocation: ParkingLocation | null;
  setInspectingCsiLocation: (loc: ParkingLocation | null) => void;
  reportingHazardLocation: ParkingLocation | null;
  setReportingHazardLocation: (loc: ParkingLocation | null) => void;
  safeWalkLocation: ParkingLocation | null;
  setSafeWalkLocation: (loc: ParkingLocation | null) => void;
  activeExitAlert: ExitTriggerAlert | null;
  setActiveExitAlert: (alert: ExitTriggerAlert | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Workflow Actions
  handleParkHere: (loc: ParkingLocation, notes?: { level?: string; stallNumber?: string; note?: string }, durationMinutes?: number) => void;
  handleLeaveParkedSpot: () => void;
  saveParkedSpot: (loc: ParkingLocation, notes?: { level?: string; stallNumber?: string; note?: string }, durationMinutes?: number) => void;
  clearParkedSpot: () => void;
  updateParkedNotes: (notes: { level?: string; stallNumber?: string; note?: string }) => void;
  guideMeToMyCar: () => void;
  handleSimulateBluetoothDisconnect: () => void;
  handleHazardSubmitted: (result: HazardValidationResult) => void;
  handleToggleSubterraneanSignalLoss: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const safetyRepo = useMemo(() => new SafetyRepositoryImpl(), []);
  const parkingRepo = useMemo(() => new ParkingRepositoryImpl(), []);
  const hazardRepo = useMemo(() => new HazardRepositoryImpl(), []);

  // Top-Level View & Onboarding state
  const [currentView, setCurrentView] = useState<ActiveAppView>('driver');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // Authentication & Stripe state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => AuthService.getCurrentUser());
  const [isStripeCheckoutOpen, setIsStripeCheckoutOpen] = useState<boolean>(false);

  useEffect(() => {
    return AuthService.subscribe((user) => {
      setCurrentUser(user);
    });
  }, []);

  // Locations state
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<ParkingLocation | null>(null);

  // Search & Destination state
  const [searchQuery, setSearchQuery] = useState<string>('Moscone Center');
  const [selectedDestination, setSelectedDestination] = useState<SearchDestination | null>(POPULAR_DESTINATIONS[0]);
  const [destinationResults, setDestinationResults] = useState<SearchDestination[]>(POPULAR_DESTINATIONS);

  // Live Geocoding Query Hook with AbortController cancellation
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    GeocodingAdapter.searchDestinations(searchQuery, controller.signal).then((results) => {
      if (active && results.length > 0) {
        setDestinationResults(results);
      }
    }).catch(() => {
      // Handled via fallback in adapter
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [searchQuery]);

  // Filter state
  const defaultFilters: FilterSettings = {
    minCsi: 0,
    maxHourlyRate: 25,
    coveredOrGarageOnly: false,
    gatedAccessOnly: false,
    monitoredCctvOnly: false,
    parkingTypeFilter: 'all',
  };
  const [filters, setFilters] = useState<FilterSettings>(defaultFilters);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  // Map layer controls
  const [showLightingHeatmap, setShowLightingHeatmap] = useState<boolean>(true);
  const [showFootTrafficZones, setShowFootTrafficZones] = useState<boolean>(false);

  // Simulation & Parked State
  const [isNightMode, setIsNightMode] = useState<boolean>(true);
  const [motionState, setMotionState] = useState<MotionState>('driving');
  const [activeParkedSession, setActiveParkedSession] = useState<SavedParkingSession | null>(() => {
    try {
      const stored = localStorage.getItem('safepark_active_session_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });
  const [parkedLocation, setParkedLocation] = useState<ParkingLocation | null>(() => {
    return OfflineCacheService.getCachedActiveSession();
  });
  const [bluetoothConnected, setBluetoothConnected] = useState<boolean>(true);

  // Modals state
  const [inspectingCsiLocation, setInspectingCsiLocation] = useState<ParkingLocation | null>(null);
  const [reportingHazardLocation, setReportingHazardLocation] = useState<ParkingLocation | null>(null);
  const [safeWalkLocation, setSafeWalkLocation] = useState<ParkingLocation | null>(null);
  const [activeExitAlert, setActiveExitAlert] = useState<ExitTriggerAlert | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load and recalculate parking spots dynamically based on destination, environment & filters
  const refreshLocations = async () => {
    let rawSpots: ParkingLocation[] = [];
    if (selectedDestination) {
      rawSpots = DynamicParkingGenerator.generateSpotsAroundDestination(
        selectedDestination,
        !isNightMode
      );
    } else {
      rawSpots = await parkingRepo.getAllParkingLocations();
    }

    const scoredSpots = rawSpots.map(spot => {
      const lighting = { ...spot.lighting, isDaytime: !isNightMode };
      const csi = CsiEngine.calculate(
        spot.id,
        spot.crimeData,
        lighting,
        spot.infrastructure,
        spot.activeHazards
      );
      return { ...spot, lighting, csi };
    });

    // Cache computed results in OfflineCacheService for subterranean fallback
    OfflineCacheService.cacheParkingLocations(scoredSpots);

    // Apply active user filters
    const filtered = scoredSpots.filter(spot => {
      if (spot.csi.totalScore < filters.minCsi) return false;
      if (spot.hourlyRate > filters.maxHourlyRate) return false;
      if (filters.parkingTypeFilter === 'garages_only' || filters.coveredOrGarageOnly) {
        const isGarage = spot.infrastructure.structureType === 'covered_underground_garage' ||
          spot.infrastructure.structureType === 'multi_level_deck' ||
          spot.infrastructure.structureType === 'gated_surface_lot';
        if (!isGarage) return false;
      }
      if (filters.parkingTypeFilter === 'street_only') {
        const isStreet = spot.infrastructure.structureType === 'curbside_street_metered' ||
          spot.infrastructure.structureType === 'curbside_residential';
        if (!isStreet) return false;
      }
      if (filters.gatedAccessOnly && !spot.infrastructure.hasControlledAccessBarrier) return false;
      if (filters.monitoredCctvOnly && spot.infrastructure.surveillance !== 'monitored_cctv_24_7') return false;
      return true;
    });

    // Sort by CSI score descending (safest spots first)
    filtered.sort((a, b) => b.csi.totalScore - a.csi.totalScore);
    setLocations(filtered);

    // Set first/top-ranked spot as selected
    if (filtered.length > 0) {
      setSelectedLocation(filtered[0]);
    } else {
      setSelectedLocation(null);
    }
  };

  // Pan-to-Scan dynamic location scanner
  const scanLocationsAt = async (coords: { lat: number; lng: number }, areaName?: string) => {
    const rawSpots = DynamicParkingGenerator.generateSpotsAroundCoordinates(
      coords,
      areaName,
      !isNightMode
    );

    const scoredSpots = rawSpots.map(spot => {
      const lighting = { ...spot.lighting, isDaytime: !isNightMode };
      const csi = CsiEngine.calculate(
        spot.id,
        spot.crimeData,
        lighting,
        spot.infrastructure,
        spot.activeHazards
      );
      return { ...spot, lighting, csi };
    });

    OfflineCacheService.cacheParkingLocations(scoredSpots);

    const filtered = scoredSpots.filter(spot => {
      if (spot.csi.totalScore < filters.minCsi) return false;
      if (spot.hourlyRate > filters.maxHourlyRate) return false;
      if (filters.parkingTypeFilter === 'garages_only' || filters.coveredOrGarageOnly) {
        const isGarage = spot.infrastructure.structureType === 'covered_underground_garage' ||
          spot.infrastructure.structureType === 'multi_level_deck' ||
          spot.infrastructure.structureType === 'gated_surface_lot';
        if (!isGarage) return false;
      }
      if (filters.parkingTypeFilter === 'street_only') {
        const isStreet = spot.infrastructure.structureType === 'curbside_street_metered' ||
          spot.infrastructure.structureType === 'curbside_residential';
        if (!isStreet) return false;
      }
      if (filters.gatedAccessOnly && !spot.infrastructure.hasControlledAccessBarrier) return false;
      if (filters.monitoredCctvOnly && spot.infrastructure.surveillance !== 'monitored_cctv_24_7') return false;
      return true;
    });

    filtered.sort((a, b) => b.csi.totalScore - a.csi.totalScore);
    setLocations(filtered);

    if (filtered.length > 0 && (!selectedLocation || !filtered.some(s => s.id === selectedLocation.id))) {
      setSelectedLocation(filtered[0]);
    }
  };

  useEffect(() => {
    refreshLocations();
  }, [selectedDestination, isNightMode, filters]);

  // Subscribe to background exit detection triggers and dispatch native push
  useEffect(() => {
    const unsub = ExitDetectionService.subscribe((alert) => {
      setActiveExitAlert(alert);
      PushNotificationService.dispatchVehicleExitPush(alert);
    });
    return () => unsub();
  }, []);

  // Action: Save Parked Spot / Find My Car
  const saveParkedSpot = (
    loc: ParkingLocation,
    notes?: { level?: string; stallNumber?: string; note?: string },
    durationMinutes?: number
  ) => {
    const is2Hr = loc.hourlyRate === 0 || loc.infrastructure.structureType === 'curbside_residential';
    const isMeter = loc.infrastructure.structureType === 'curbside_street_metered';
    const spotType = is2Hr ? 'free_curbside' : isMeter ? 'metered' : 'garage';

    const now = Date.now();
    const duration = durationMinutes || (is2Hr ? 120 : isMeter ? 120 : 480);
    const expirationTimestamp = now + duration * 60 * 1000;

    const session: SavedParkingSession = {
      id: `session-${now}`,
      locationId: loc.id,
      spotName: loc.name,
      address: loc.address,
      spotType,
      coordinates: loc.coordinates,
      parkedAtTimestamp: now,
      expirationTimestamp,
      streetSweepingNotice: is2Hr || isMeter ? '🧹 Sweeping: 1st & 3rd Tue 9–11 AM' : undefined,
      garageNotes: notes,
      csiScore: loc.csi.totalScore,
      hourlyRate: loc.hourlyRate,
    };

    setActiveParkedSession(session);
    try {
      localStorage.setItem('safepark_active_session_v1', JSON.stringify(session));
    } catch {}

    setParkedLocation(loc);
    setMotionState('parked');
    setBluetoothConnected(false);
    OfflineCacheService.cacheActiveSession(loc);

    const alert = ExitDetectionService.triggerBluetoothDisconnect(loc);
    setActiveExitAlert(alert);
    PushNotificationService.dispatchVehicleExitPush(alert);

    showToast(`📍 Vehicle Parked at ${loc.name}. "Find My Car" active.`);
  };

  const handleParkHere = (
    loc: ParkingLocation,
    notes?: { level?: string; stallNumber?: string; note?: string },
    durationMinutes?: number
  ) => {
    saveParkedSpot(loc, notes, durationMinutes);
  };

  // Action: Leave parked spot / Clear
  const handleLeaveParkedSpot = () => {
    setActiveParkedSession(null);
    try {
      localStorage.removeItem('safepark_active_session_v1');
    } catch {}
    setParkedLocation(null);
    setMotionState('driving');
    setBluetoothConnected(true);
    OfflineCacheService.cacheActiveSession(null);
    showToast('🚗 Resumed driving mode. Bluetooth audio reconnected.');
  };

  const clearParkedSpot = () => {
    handleLeaveParkedSpot();
  };

  const updateParkedNotes = (notes: { level?: string; stallNumber?: string; note?: string }) => {
    if (!activeParkedSession) return;
    const updated = {
      ...activeParkedSession,
      garageNotes: { ...activeParkedSession.garageNotes, ...notes },
    };
    setActiveParkedSession(updated);
    try {
      localStorage.setItem('safepark_active_session_v1', JSON.stringify(updated));
    } catch {}
    showToast('Saved vehicle notes');
  };

  const guideMeToMyCar = () => {
    if (!activeParkedSession) return;
    setSelectedDestination({
      id: activeParkedSession.id,
      name: activeParkedSession.spotName,
      address: activeParkedSession.address,
      coordinates: activeParkedSession.coordinates,
    });
    showToast(`🚶 Guided Safe Walk back to ${activeParkedSession.spotName} illuminated`);
  };

  // Action: Simulate Bluetooth disconnect manually
  const handleSimulateBluetoothDisconnect = () => {
    const target = parkedLocation || selectedLocation || locations[0];
    if (target) {
      setBluetoothConnected(false);
      setMotionState('parked');
      setParkedLocation(target);
      OfflineCacheService.cacheActiveSession(target);
      const alert = ExitDetectionService.triggerBluetoothDisconnect(target);
      setActiveExitAlert(alert);
      PushNotificationService.dispatchVehicleExitPush(alert);
    }
  };

  const handleToggleSubterraneanSignalLoss = () => {
    const isOffline = OfflineCacheService.toggleSubterraneanSimulation();
    showToast(isOffline ? '📡 Subterranean Garage Signal Loss Triggered (Offline Cache Active)' : '📶 Reconnected to Cellular Network');
  };

  const toggleBluetooth = () => {
    if (bluetoothConnected) {
      handleSimulateBluetoothDisconnect();
    } else {
      setBluetoothConnected(true);
      showToast('🔗 Bluetooth Car Audio re-established');
    }
  };

  const handleHazardSubmitted = (result: HazardValidationResult) => {
    setReportingHazardLocation(null);
    showToast('✅ Verifiable Physical Hazard Ingested. CSI recalculated.');
    refreshLocations();
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        isOnboardingOpen,
        setIsOnboardingOpen,
        currentUser,
        setCurrentUser,
        isStripeCheckoutOpen,
        setIsStripeCheckoutOpen,
        safetyRepo,
        parkingRepo,
        hazardRepo,
        locations,
        selectedLocation,
        setSelectedLocation,
        refreshLocations,
        scanLocationsAt,
        searchQuery,
        setSearchQuery,
        selectedDestination,
        setSelectedDestination,
        destinationResults,
        filters,
        setFilters,
        resetFilters,
        isFilterModalOpen,
        setIsFilterModalOpen,
        showLightingHeatmap,
        setShowLightingHeatmap,
        showFootTrafficZones,
        setShowFootTrafficZones,
        isNightMode,
        setIsNightMode,
        motionState,
        setMotionState,
        parkedLocation,
        activeParkedSession,
        bluetoothConnected,
        toggleBluetooth,
        inspectingCsiLocation,
        setInspectingCsiLocation,
        reportingHazardLocation,
        setReportingHazardLocation,
        safeWalkLocation,
        setSafeWalkLocation,
        activeExitAlert,
        setActiveExitAlert,
        toastMessage,
        showToast,
        handleParkHere,
        handleLeaveParkedSpot,
        saveParkedSpot,
        clearParkedSpot,
        updateParkedNotes,
        guideMeToMyCar,
        handleSimulateBluetoothDisconnect,
        handleHazardSubmitted,
        handleToggleSubterraneanSignalLoss,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
