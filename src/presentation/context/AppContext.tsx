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

export type ActiveAppView = 'driver' | 'carplay' | 'b2b_portal' | 'enterprise_api' | 'user_profile' | 'admin_ops';
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
  handleParkHere: (loc: ParkingLocation) => void;
  handleLeaveParkedSpot: () => void;
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
    maxHourlyRate: 15,
    coveredOrGarageOnly: false,
    gatedAccessOnly: false,
    monitoredCctvOnly: false,
  };
  const [filters, setFilters] = useState<FilterSettings>(defaultFilters);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  // Map layer controls
  const [showLightingHeatmap, setShowLightingHeatmap] = useState<boolean>(true);
  const [showFootTrafficZones, setShowFootTrafficZones] = useState<boolean>(false);

  // Simulation State
  const [isNightMode, setIsNightMode] = useState<boolean>(true);
  const [motionState, setMotionState] = useState<MotionState>('driving');
  const [parkedLocation, setParkedLocation] = useState<ParkingLocation | null>(() => OfflineCacheService.getCachedActiveSession());
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
      if (filters.coveredOrGarageOnly && spot.infrastructure.structureType !== 'covered_underground_garage' && spot.infrastructure.structureType !== 'multi_level_deck') {
        return false;
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

  // Action: User clicks "Park Here"
  const handleParkHere = (loc: ParkingLocation) => {
    setParkedLocation(loc);
    setMotionState('parked');
    setBluetoothConnected(false);
    OfflineCacheService.cacheActiveSession(loc);
    const alert = ExitDetectionService.triggerBluetoothDisconnect(loc);
    setActiveExitAlert(alert);
    PushNotificationService.dispatchVehicleExitPush(alert);
    showToast(`📍 Vehicle Parked at ${loc.name}. Exit safety trigger armed.`);
  };

  // Action: Leave parked spot
  const handleLeaveParkedSpot = () => {
    setParkedLocation(null);
    setMotionState('driving');
    setBluetoothConnected(true);
    OfflineCacheService.cacheActiveSession(null);
    showToast('🚗 Resumed driving mode. Bluetooth audio reconnected.');
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
