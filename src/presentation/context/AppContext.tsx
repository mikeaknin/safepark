import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { ParkingLocation } from '../../domain/models/ParkingLocation';
import { SafetyRepositoryImpl } from '../../data/repositories/SafetyRepositoryImpl';
import { ParkingRepositoryImpl } from '../../data/repositories/ParkingRepositoryImpl';
import { HazardRepositoryImpl } from '../../data/repositories/HazardRepositoryImpl';
import { ExitDetectionService, ExitTriggerAlert } from '../../domain/services/ExitDetectionService';
import { OfflineCacheService } from '../../domain/services/OfflineCacheService';
import { HazardValidationResult } from '../../domain/models/HazardReport';
import { AuthService, AuthUser } from '../../domain/services/AuthService';
import { PushNotificationService } from '../../domain/services/PushNotificationService';
import { GeocodingAdapter } from '../../data/adapters/GeocodingAdapter';
import { SavedParkingSession } from '../../domain/models/SavedParkingSession';
import { PedestrianRoutingAdapter } from '../../data/adapters/PedestrianRoutingAdapter';
import {
  LiveParkingService,
  SupportedCity,
  CITY_CONFIGS,
} from '../../services/liveParkingService';

export type ActiveAppView = 'driver' | 'my_car' | 'safe_garages' | 'profile' | 'carplay' | 'b2b_portal' | 'enterprise_api' | 'user_profile' | 'admin_ops';
export type MotionState = 'driving' | 'parked' | 'walking';

export interface ActiveNavigationRoute {
  mode: 'safe_walk_return' | 'in_car_directions' | 'illuminated_path';
  waypoints: Array<[number, number]>;
  distanceMeters: number;
  distanceText: string;
  durationMinutes: number;
  durationText: string;
  originCoordinates: { lat: number; lng: number };
  destinationCoordinates: { lat: number; lng: number };
  destinationName: string;
}

export interface SearchDestination {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
}

export const SF_POPULAR_DESTINATIONS: SearchDestination[] = [
  { id: 'sf-1', name: 'Downtown San Francisco', address: 'Market St & Powell St, San Francisco, CA', coordinates: { lat: 37.7842, lng: -122.4015 } },
  { id: 'sf-2', name: 'Moscone Convention Center', address: '747 Howard St, San Francisco, CA', coordinates: { lat: 37.7842, lng: -122.4015 } },
  { id: 'sf-3', name: 'Salesforce Tower & Transbay', address: '415 Mission St, San Francisco, CA', coordinates: { lat: 37.7897, lng: -122.3972 } },
  { id: 'sf-4', name: 'Union Square District', address: '333 Post St, San Francisco, CA', coordinates: { lat: 37.7879, lng: -122.4075 } },
  { id: 'sf-5', name: 'Oracle Park / Mission Bay', address: '24 Willie Mays Plaza, San Francisco, CA', coordinates: { lat: 37.7786, lng: -122.3893 } },
];

export const LA_POPULAR_DESTINATIONS: SearchDestination[] = [
  { id: 'la-1', name: 'Downtown Los Angeles (DTLA)', address: 'Grand Central Market, Los Angeles, CA', coordinates: { lat: 34.0505, lng: -118.2492 } },
  { id: 'la-2', name: 'Hollywood Walk of Fame', address: '6801 Hollywood Blvd, Los Angeles, CA', coordinates: { lat: 34.1016, lng: -118.3414 } },
  { id: 'la-3', name: 'Santa Monica Pier', address: '200 Santa Monica Pier, Santa Monica, CA', coordinates: { lat: 34.0099, lng: -118.4965 } },
  { id: 'la-4', name: 'Venice Beach Boardwalk', address: '1800 Ocean Front Walk, Venice, CA', coordinates: { lat: 33.9850, lng: -118.4695 } },
  { id: 'la-5', name: 'Crypto.com Arena / LA Live', address: '1111 S Figueroa St, Los Angeles, CA', coordinates: { lat: 34.0430, lng: -118.2673 } },
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
  // City Navigation & Multi-City State
  selectedCity: SupportedCity;
  setSelectedCity: (city: SupportedCity) => void;
  switchCity: (city: SupportedCity) => Promise<void>;
  isLiveLoading: boolean;
  liveLoadError: string | null;
  retryLiveLoad: () => void;
  totalCrimesCount: number;
  totalFacilitiesCount: number;

  // Navigation & Multi-Sided View Switching
  currentView: ActiveAppView;
  setCurrentView: (view: ActiveAppView) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;

  // Active Navigation / Return Walking Route
  activeRoute: ActiveNavigationRoute | null;
  setActiveRoute: React.Dispatch<React.SetStateAction<ActiveNavigationRoute | null>>;
  startSafeWalkToCar: (origin?: { lat: number; lng: number }) => Promise<void>;
  clearActiveRoute: () => void;

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

const haversineDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const safetyRepo = useMemo(() => new SafetyRepositoryImpl(), []);
  const parkingRepo = useMemo(() => new ParkingRepositoryImpl(), []);
  const hazardRepo = useMemo(() => new HazardRepositoryImpl(), []);

  const initialCity: SupportedCity = (() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('city');
      if (param === 'la' || param === 'sf') return param;
    }
    return 'sf';
  })();

  // Multi-City State: default San Francisco or from URL param
  const [selectedCity, setSelectedCity] = useState<SupportedCity>(initialCity);
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(true);
  const [liveLoadError, setLiveLoadError] = useState<string | null>(null);
  const [rawScoredLocations, setRawScoredLocations] = useState<ParkingLocation[]>([]);
  const [totalCrimesCount, setTotalCrimesCount] = useState<number>(0);
  const [totalFacilitiesCount, setTotalFacilitiesCount] = useState<number>(0);

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
  const [searchQuery, setSearchQuery] = useState<string>(
    initialCity === 'la' ? LA_POPULAR_DESTINATIONS[0].name : 'Downtown San Francisco'
  );
  const [selectedDestination, setSelectedDestination] = useState<SearchDestination | null>(
    initialCity === 'la' ? LA_POPULAR_DESTINATIONS[0] : SF_POPULAR_DESTINATIONS[0]
  );
  const [destinationResults, setDestinationResults] = useState<SearchDestination[]>(
    initialCity === 'la' ? LA_POPULAR_DESTINATIONS : SF_POPULAR_DESTINATIONS
  );

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

  // Helper to filter and sort scored locations according to active user filters
  const applyFilters = useCallback((spots: ParkingLocation[], currentFilters: FilterSettings): ParkingLocation[] => {
    const filtered = spots.filter((spot) => {
      if (spot.csi.totalScore < currentFilters.minCsi) return false;
      if (spot.hourlyRate > currentFilters.maxHourlyRate) return false;
      if (currentFilters.parkingTypeFilter === 'garages_only' || currentFilters.coveredOrGarageOnly) {
        const isGarage =
          spot.infrastructure.structureType === 'covered_underground_garage' ||
          spot.infrastructure.structureType === 'multi_level_deck';
        if (!isGarage) return false;
      }
      if (currentFilters.parkingTypeFilter === 'street_only') {
        const isStreet =
          spot.infrastructure.structureType === 'curbside_street_metered' ||
          spot.infrastructure.structureType === 'curbside_residential' ||
          spot.infrastructure.structureType === 'open_surface_lot' ||
          spot.infrastructure.structureType === 'gated_surface_lot';
        if (!isStreet) return false;
      }
      if (currentFilters.gatedAccessOnly && !spot.infrastructure.hasControlledAccessBarrier) return false;
      if (currentFilters.monitoredCctvOnly && spot.infrastructure.surveillance !== 'monitored_cctv_24_7') return false;
      return true;
    });

    return filtered.sort((a, b) => b.csi.totalScore - a.csi.totalScore);
  }, []);

  // Primary Live Data Loader for City
  const loadLiveCityData = useCallback(async (city: SupportedCity) => {
    setIsLiveLoading(true);
    setLiveLoadError(null);
    try {
      const result = await LiveParkingService.loadCityLiveParking(city);
      setRawScoredLocations(result.scoredLocations);
      setTotalFacilitiesCount(result.facilities.length);
      setTotalCrimesCount(result.crimes.length);

      OfflineCacheService.cacheParkingLocations(result.scoredLocations);

      const filtered = applyFilters(result.scoredLocations, filters);
      setLocations(filtered);
      if (filtered.length > 0) {
        setSelectedLocation(filtered[0]);
      } else {
        setSelectedLocation(null);
      }

      showToast(`🟢 Loaded ${result.facilities.length} live parking lots & ${result.crimes.length} crime records in ${CITY_CONFIGS[city].name}`);
    } catch (err: any) {
      console.error('Failed to load live city data:', err);
      setLiveLoadError(err?.message || 'Municipal feed timeout or network error');
      showToast(`⚠️ Could not reach municipal feed for ${CITY_CONFIGS[city].name}. Tap Retry.`);
    } finally {
      setIsLiveLoading(false);
    }
  }, [applyFilters, filters]);

  // Initial load
  useEffect(() => {
    loadLiveCityData(selectedCity);
  }, []);

  // Memoize filtered and sorted locations off the main render loop to ensure
  // marker generation and filtering does not block map panning or bottom sheet animations
  const memoizedFilteredLocations = useMemo(() => {
    if (rawScoredLocations.length === 0) return [];
    return applyFilters(rawScoredLocations, filters);
  }, [rawScoredLocations, filters, applyFilters]);

  useEffect(() => {
    if (memoizedFilteredLocations.length > 0) {
      setLocations(memoizedFilteredLocations);
      if (!selectedLocation || !memoizedFilteredLocations.some((s) => s.id === selectedLocation.id)) {
        setSelectedLocation(memoizedFilteredLocations[0]);
      }
    } else if (rawScoredLocations.length === 0) {
      setLocations([]);
      setSelectedLocation(null);
    }
  }, [memoizedFilteredLocations, rawScoredLocations.length]);

  // Switch City Action: wipes markers, updates map center, triggers fresh live fetch
  const switchCity = async (city: SupportedCity) => {
    if (city === selectedCity) return;

    setSelectedCity(city);
    setLocations([]); // wipe previous markers
    setRawScoredLocations([]);
    setSelectedLocation(null);
    setLiveLoadError(null);

    const defaultDest = city === 'sf' ? SF_POPULAR_DESTINATIONS[0] : LA_POPULAR_DESTINATIONS[0];
    setSelectedDestination(defaultDest);
    setSearchQuery(defaultDest.name);
    setDestinationResults(city === 'sf' ? SF_POPULAR_DESTINATIONS : LA_POPULAR_DESTINATIONS);

    if (typeof window !== 'undefined' && window.history) {
      const url = new URL(window.location.href);
      url.searchParams.set('city', city);
      window.history.replaceState({}, '', url.toString());
    }

    await loadLiveCityData(city);
  };

  const refreshLocations = async () => {
    await loadLiveCityData(selectedCity);
  };

  const retryLiveLoad = () => {
    loadLiveCityData(selectedCity);
  };

  // Pan-to-scan: filter locations nearest to coordinates
  const scanLocationsAt = async (coords: { lat: number; lng: number }) => {
    if (rawScoredLocations.length === 0) return;

    // Sort by proximity to center
    const sorted = [...rawScoredLocations].sort((a, b) => {
      const distA = haversineDistanceMeters(coords.lat, coords.lng, a.coordinates.lat, a.coordinates.lng);
      const distB = haversineDistanceMeters(coords.lat, coords.lng, b.coordinates.lat, b.coordinates.lng);
      return distA - distB;
    });

    const filtered = applyFilters(sorted, filters);
    setLocations(filtered);
    if (filtered.length > 0 && (!selectedLocation || !filtered.some((s) => s.id === selectedLocation.id))) {
      setSelectedLocation(filtered[0]);
    }
  };

  // Park Here Workflow Actions
  const handleParkHere = (
    loc: ParkingLocation,
    notes?: { level?: string; stallNumber?: string; note?: string },
    durationMinutes: number = 120
  ) => {
    const isFree = loc.hourlyRate === 0;
    const isMeter = loc.infrastructure.structureType === 'curbside_street_metered';
    const spotType = isFree ? 'free_curbside' : isMeter ? 'metered' : 'garage';

    const session: SavedParkingSession = {
      id: `session_${Date.now()}`,
      locationId: loc.id,
      spotName: loc.name,
      address: loc.address,
      spotType,
      coordinates: loc.coordinates,
      parkedAtTimestamp: Date.now(),
      expirationTimestamp: Date.now() + durationMinutes * 60 * 1000,
      garageNotes: {
        level: notes?.level || 'Level 1',
        stallNumber: notes?.stallNumber || 'Stall A-12',
        note: notes?.note || 'Parked safely via SafePark live index',
      },
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
    showToast(`🅿️ Parked vehicle saved at ${loc.name}. Return timer active.`);
  };

  const saveParkedSpot = (
    loc: ParkingLocation,
    notes?: { level?: string; stallNumber?: string; note?: string },
    durationMinutes: number = 120
  ) => {
    handleParkHere(loc, notes, durationMinutes);
  };

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

  // Active Navigation Route state
  const [activeRoute, setActiveRoute] = useState<ActiveNavigationRoute | null>(null);

  const startSafeWalkToCar = async (origin?: { lat: number; lng: number }) => {
    if (!activeParkedSession) {
      showToast('⚠️ No active vehicle parked to route back to.');
      return;
    }

    const dest = activeParkedSession.coordinates;
    let startPoint = origin;

    if (startPoint) {
      const d = haversineDistanceMeters(startPoint.lat, startPoint.lng, dest.lat, dest.lng);
      if (d > 10000 || isNaN(d)) {
        startPoint = { lat: dest.lat + 0.0018, lng: dest.lng + 0.0018 };
      }
    } else {
      startPoint = { lat: dest.lat + 0.0018, lng: dest.lng + 0.0018 };
    }

    const routeResult = await PedestrianRoutingAdapter.getPedestrianRoute(startPoint, dest);
    const feet = Math.round(routeResult.distanceMeters * 3.28084);
    const distanceText = routeResult.distanceMeters < 1000 ? `${feet} ft` : `${(routeResult.distanceMeters / 1609.34).toFixed(1)} mi`;

    setActiveRoute({
      mode: 'safe_walk_return',
      waypoints: routeResult.coordinates,
      distanceMeters: routeResult.distanceMeters,
      distanceText,
      durationMinutes: routeResult.durationMinutes,
      durationText: `${routeResult.durationMinutes} min`,
      originCoordinates: startPoint,
      destinationCoordinates: dest,
      destinationName: activeParkedSession.spotName,
    });

    setCurrentView('driver');
    showToast(`🚶 Safe Walk to ${activeParkedSession.spotName} illuminated (${distanceText} • ${routeResult.durationMinutes} min)`);
  };

  const clearActiveRoute = () => {
    setActiveRoute(null);
  };

  const guideMeToMyCar = () => {
    startSafeWalkToCar();
  };

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

  const handleHazardSubmitted = (_result: HazardValidationResult) => {
    setReportingHazardLocation(null);
    showToast('✅ Physical Hazard Ingested. CSI recalculated.');
    refreshLocations();
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <AppContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        switchCity,
        isLiveLoading,
        liveLoadError,
        retryLiveLoad,
        totalCrimesCount,
        totalFacilitiesCount,
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
        activeRoute,
        setActiveRoute,
        startSafeWalkToCar,
        clearActiveRoute,
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
