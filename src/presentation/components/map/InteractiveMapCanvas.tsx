import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import { ParkingLocation } from '../../../domain/models/ParkingLocation';
import { getStatusStyle, SAFE_PARK_TOKENS } from '../../../theme/tokens';
import { PedestrianRoutingAdapter } from '../../../data/adapters/PedestrianRoutingAdapter';
import {
  LocateFixed,
  Sun,
  Footprints,
  Compass,
  Navigation,
  X,
} from 'lucide-react';

interface InteractiveMapCanvasProps {
  isFullscreen?: boolean;
}

export const InteractiveMapCanvas: React.FC<InteractiveMapCanvasProps> = ({
  isFullscreen = true,
}) => {
  const {
    locations,
    selectedLocation,
    setSelectedLocation,
    selectedDestination,
    setSelectedDestination,
    showLightingHeatmap,
    setShowLightingHeatmap,
    parkedLocation,
    activeParkedSession,
    activeRoute,
    clearActiveRoute,
    showToast,
    scanLocationsAt,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const curbSegmentsGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routeGroupRef = useRef<L.LayerGroup | null>(null);
  const lightingGroupRef = useRef<L.LayerGroup | null>(null);
  const userLocationGroupRef = useRef<L.LayerGroup | null>(null);

  const isProgrammaticFlightRef = useRef<boolean>(false);
  const scanLocationsAtRef = useRef(scanLocationsAt);
  scanLocationsAtRef.current = scanLocationsAt;

  const [deviceCoordinates, setDeviceCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [deviceAccuracy, setDeviceAccuracy] = useState<number>(30);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // 1. Initialize Real Slippy Leaflet Tile Map with Standard OpenStreetMap Layer & Moveend Pan-to-Scan Listener
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = selectedDestination?.coordinates.lat || 37.7842;
    const initialLng = selectedDestination?.coordinates.lng || -122.4015;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    // Standard Bulletproof Zero-Auth OpenStreetMap Tiles
    const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
    tileLayer.addTo(map);

    // Initialize Layer Groups in proper z-index order
    lightingGroupRef.current = L.layerGroup().addTo(map);
    curbSegmentsGroupRef.current = L.layerGroup().addTo(map);
    routeGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);
    userLocationGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size immediately and with delay to force full viewport painting
    map.invalidateSize();
    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    // Dynamic "Pan-to-Scan" Moveend Listener (350ms debounce)
    let moveEndTimeout: any = null;
    const handleMoveEnd = () => {
      if (isProgrammaticFlightRef.current) {
        return;
      }
      if (moveEndTimeout) {
        clearTimeout(moveEndTimeout);
      }
      moveEndTimeout = setTimeout(() => {
        if (!mapInstanceRef.current || isProgrammaticFlightRef.current) return;
        const center = mapInstanceRef.current.getCenter();
        scanLocationsAtRef.current({ lat: center.lat, lng: center.lng });
      }, 350);
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (moveEndTimeout) clearTimeout(moveEndTimeout);
      map.off('moveend', handleMoveEnd);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Real Panning & Re-Centering on Destination Coordinates Update
  useEffect(() => {
    if (mapInstanceRef.current && selectedDestination?.coordinates) {
      const { lat, lng } = selectedDestination.coordinates;
      isProgrammaticFlightRef.current = true;
      mapInstanceRef.current.flyTo([lat, lng], 16, {
        animate: true,
        duration: 1.2,
      });
      const flightTimer = setTimeout(() => {
        isProgrammaticFlightRef.current = false;
      }, 1500);
      return () => clearTimeout(flightTimer);
    }
  }, [selectedDestination]);

  // 3. High-Accuracy Real-Time GPS Tracking
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setDeviceCoordinates({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setDeviceAccuracy(pos.coords.accuracy || 30);
      },
      (err) => {
        console.warn('Geolocation notice:', err.message);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 3000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 4. Render Pulsating Blue User GPS Beacon on Canvas
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocationGroupRef.current) return;

    userLocationGroupRef.current.clearLayers();

    if (!deviceCoordinates) return;

    const { lat, lng } = deviceCoordinates;

    // Accuracy Halo Circle
    L.circle([lat, lng], {
      radius: Math.min(60, Math.max(15, deviceAccuracy)),
      color: '#3B82F6',
      fillColor: '#60A5FA',
      fillOpacity: 0.15,
      weight: 1,
      interactive: false,
    }).addTo(userLocationGroupRef.current);

    // Pulsating Blue Core Beacon
    const userBeaconIcon = L.divIcon({
      className: 'safepark-user-beacon',
      html: `
        <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); pointer-events: none;">
          <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background-color: rgba(37, 99, 235, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #2563EB; border: 2.5px solid #FFFFFF; box-shadow: 0 0 8px rgba(37,99,235,0.8); z-index: 2;"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    L.marker([lat, lng], { icon: userBeaconIcon, zIndexOffset: 2000 }).addTo(userLocationGroupRef.current);
  }, [deviceCoordinates, deviceAccuracy]);

  // 5. Render Markers & Curbside Parking Overlays (Metered, 2-Hr Free, Garages)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current || !curbSegmentsGroupRef.current) return;

    markersGroupRef.current.clearLayers();
    curbSegmentsGroupRef.current.clearLayers();

    // A. Render Destination Pin
    if (selectedDestination?.coordinates) {
      const { lat, lng } = selectedDestination.coordinates;

      const destIcon = L.divIcon({
        className: 'safepark-destination-marker-wrapper',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); pointer-events: auto; cursor: default;">
            <div style="background-color: #0F172A; color: #FFFFFF; padding: 4px 10px; border-radius: 9999px; font-size: 0.725rem; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 14px rgba(15,23,42,0.4); border: 1.5px solid #38BDF8; display: flex; align-items: center; gap: 5px;">
              <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background-color: #38BDF8; box-shadow: 0 0 6px #38BDF8;"></span>
              <span>Target: ${selectedDestination.name}</span>
            </div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #2563EB; border: 2.5px solid #FFFFFF; box-shadow: 0 0 12px rgba(37,99,235,0.8); margin-top: -2px;"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      L.marker([lat, lng], { icon: destIcon, zIndexOffset: 1000 }).addTo(markersGroupRef.current);
    }

    // B. Render Parking Facility Pins with Visual Type Badges & Curbside Overlays
    // Apply clean spatial fanning so 3-4 spots near the same intersection do not stack into an unreadable block
    const positionBuckets = new Map<string, number>();

    locations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const isParked = parkedLocation?.id === loc.id;
      const status = getStatusStyle(loc.csi.totalScore);

      // Bucket by ~15m precision
      const gridKey = `${loc.coordinates.lat.toFixed(4)},${loc.coordinates.lng.toFixed(4)}`;
      const indexInBucket = positionBuckets.get(gridKey) || 0;
      positionBuckets.set(gridKey, indexInBucket + 1);

      // Subtle dynamic offset to fan out overlapping pins neatly
      let displayLat = loc.coordinates.lat;
      let displayLng = loc.coordinates.lng;
      if (indexInBucket > 0) {
        const angle = (indexInBucket * (2 * Math.PI)) / 4;
        const radius = 0.00015 * Math.ceil(indexInBucket / 4); // ~15m
        displayLat += radius * Math.cos(angle);
        displayLng += radius * Math.sin(angle);
      }

      const is2HrFree = loc.hourlyRate === 0 || loc.infrastructure.structureType === 'curbside_residential';
      const isMetered = loc.infrastructure.structureType === 'curbside_street_metered';
      const isGarage = !is2HrFree && !isMetered;

      let typeTag = '🏢 GARAGE';
      let typeColor = '#7E22CE';
      let typeBg = '#FAF5FF';
      let curbColor = '#8B5CF6';
      let rateDisplay = `$${loc.hourlyRate.toFixed(0)}/hr`;

      if (is2HrFree) {
        typeTag = '⏱️ 2-HR FREE';
        typeColor = '#047857';
        typeBg = '#ECFDF5';
        curbColor = '#10B981';
        rateDisplay = 'Free';
      } else if (isMetered) {
        typeTag = '🅿️ METER';
        typeColor = '#1D4ED8';
        typeBg = '#EFF6FF';
        curbColor = '#3B82F6';
        rateDisplay = `$${loc.hourlyRate.toFixed(2)}/hr`;
      }

      // 1. Draw Visual Street Curbside Highlight / Garage Footprint on Map Canvas
      if (is2HrFree || isMetered) {
        // Draw dashed curb line along street
        const curbPolyline = L.polyline(
          [
            [loc.coordinates.lat - 0.0003, loc.coordinates.lng - 0.0003],
            [loc.coordinates.lat + 0.0003, loc.coordinates.lng + 0.0003],
          ],
          {
            color: curbColor,
            weight: isSelected ? 6 : 4,
            opacity: isSelected ? 0.95 : 0.7,
            dashArray: '6, 6',
            lineCap: 'round',
          }
        );
        curbPolyline.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedLocation(loc);
        });
        curbPolyline.addTo(curbSegmentsGroupRef.current!);
      } else {
        // Draw garage secure boundary outline
        const garageCircle = L.circle([loc.coordinates.lat, loc.coordinates.lng], {
          radius: 28,
          color: '#8B5CF6',
          fillColor: '#C4B5FD',
          fillOpacity: isSelected ? 0.25 : 0.12,
          weight: isSelected ? 2.5 : 1.5,
          interactive: true,
        });
        garageCircle.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedLocation(loc);
        });
        garageCircle.addTo(curbSegmentsGroupRef.current!);
      }

      // 2. Build High-Clarity Multi-Attribute Map Pin
      let pinBg = '#FFFFFF';
      let pinText = '#15803D';
      let pinBorder = isSelected ? '#2563EB' : '#CBD5E1';

      if (loc.csi.totalScore < 50) {
        pinText = '#BE123C';
        pinBorder = isSelected ? '#2563EB' : '#FECDD3';
      } else if (loc.csi.totalScore < 75) {
        pinText = '#B45309';
        pinBorder = isSelected ? '#2563EB' : '#FDE68A';
      }

      const parkingIcon = L.divIcon({
        className: `safepark-pin-${loc.id}`,
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%) ${isSelected ? 'scale(1.08)' : 'scale(1)'}; cursor: pointer; transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1); pointer-events: auto;">
            ${
              isParked
                ? `<div style="background-color: #15803D; color: #FFFFFF; font-size: 0.6rem; font-weight: 800; padding: 1px 6px; border-radius: 9999px; margin-bottom: 2px; box-shadow: 0 2px 6px rgba(21,128,61,0.4); text-transform: uppercase;">Active Spot</div>`
                : ''
            }
            <div style="background-color: ${pinBg}; border: ${
          isSelected ? '2.5px solid #2563EB' : `1.5px solid ${pinBorder}`
        }; border-radius: 12px; padding: 4px 8px; box-shadow: ${
          isSelected
            ? '0 0 0 4px rgba(37,99,235,0.35), 0 10px 24px rgba(15,23,42,0.3)'
            : '0 3px 12px rgba(15,23,42,0.15)'
        }; display: flex; flex-direction: column; gap: 2px; min-width: 92px;">
              <!-- Top Row: Spot Type Tag & Rate -->
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 4px; font-size: 0.65rem; font-weight: 800;">
                <span style="color: ${typeColor}; background-color: ${typeBg}; padding: 1px 4px; border-radius: 4px;">${typeTag}</span>
                <span style="color: #0F172A; font-weight: 800;">${rateDisplay}</span>
              </div>
              <!-- Bottom Row: CSI Score & Open Spaces -->
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; font-size: 0.725rem; font-weight: 800; color: ${pinText}; border-top: 1px solid #F1F5F9; padding-top: 2px;">
                <span>🛡️ CSI ${loc.csi.totalScore}</span>
                <span style="font-size: 0.65rem; color: #64748B; font-weight: 700;">${loc.availableSpaces} open</span>
              </div>
            </div>
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${
              isSelected ? '#2563EB' : pinBorder
            }; margin-top: -1px;"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([displayLat, displayLng], {
        icon: parkingIcon,
        zIndexOffset: isSelected ? 2500 : isParked ? 1500 : 500,
        interactive: true,
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedLocation(loc);
      });

      marker.addTo(markersGroupRef.current!);
    });

      // 3. Render Persistent Active Vehicle Pin & Radiating Radar Beacon
      if (activeParkedSession) {
        const vehicleIcon = L.divIcon({
          className: 'safepark-vehicle-pin',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer; pointer-events: auto;">
              <div style="background-color: #2563EB; color: #FFFFFF; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 9999px; box-shadow: 0 2px 8px rgba(37,99,235,0.4); margin-bottom: 2px; white-space: nowrap; display: flex; align-items: center; gap: 3px;">
                <span>🚗 My Car</span>
              </div>
              <div style="position: relative; width: 36px; height: 36px; border-radius: 50%; background-color: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(37,99,235,0.6); display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 17px;">🚗</span>
                <div style="position: absolute; inset: -8px; border-radius: 50%; border: 2px solid #3B82F6; opacity: 0.75; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              </div>
              <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #2563EB; margin-top: -1px;"></div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const carMarker = L.marker([activeParkedSession.coordinates.lat, activeParkedSession.coordinates.lng], {
          icon: vehicleIcon,
          zIndexOffset: 3000,
          interactive: true,
        });

        carMarker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          const matched = locations.find((l) => l.id === activeParkedSession.locationId);
          if (matched) {
            setSelectedLocation(matched);
          }
        });

        carMarker.addTo(markersGroupRef.current!);
      }
    }, [locations, selectedLocation, selectedDestination, parkedLocation, activeParkedSession, setSelectedLocation]);

  // 6. True Pedestrian Street-Snapped Walking Routing (OSRM Foot Engine)
  useEffect(() => {
    if (!mapInstanceRef.current || !routeGroupRef.current) return;

    let isCancelled = false;
    routeGroupRef.current.clearLayers();

    // Case A: Active Safe Walk Return Route
    if (activeRoute && activeRoute.mode === 'safe_walk_return') {
      const waypoints = activeRoute.waypoints;
      if (waypoints.length > 0) {
        // Outer Glowing Halo (Emerald/Mint)
        L.polyline(waypoints, {
          color: '#86EFAC',
          weight: 12,
          opacity: 0.65,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(routeGroupRef.current);

        // Core Illuminated Polyline
        const corePolyline = L.polyline(waypoints, {
          color: '#10B981',
          weight: 6,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(routeGroupRef.current);

        // Pulsing Pedestrian Origin Marker
        const walkerIcon = L.divIcon({
          className: 'safepark-walker-marker',
          html: `
            <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); pointer-events: none;">
              <div style="position: absolute; inset: -4px; border-radius: 50%; background-color: rgba(16, 185, 129, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #065F46; border: 2.5px solid #10B981; box-shadow: 0 0 12px rgba(16, 185, 129, 0.9); display: flex; align-items: center; justify-content: center; font-size: 14px;">
                🚶
              </div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        L.marker([activeRoute.originCoordinates.lat, activeRoute.originCoordinates.lng], {
          icon: walkerIcon,
          zIndexOffset: 3200,
        }).addTo(routeGroupRef.current);

        // Fit map bounds to frame full illuminated walking route
        try {
          isProgrammaticFlightRef.current = true;
          mapInstanceRef.current.fitBounds(corePolyline.getBounds(), {
            padding: [70, 70],
            maxZoom: 17,
          });
          setTimeout(() => {
            isProgrammaticFlightRef.current = false;
          }, 1000);
        } catch {}
      }
      return;
    }

    // Case B: General Spot-to-Destination Walking Route
    const activeSpot = selectedLocation || locations[0];
    if (!activeSpot) return;

    // Use selectedDestination coordinates, or fall back to first spot / center
    const destCoords = selectedDestination?.coordinates || {
      lat: activeSpot.coordinates.lat + 0.001,
      lng: activeSpot.coordinates.lng + 0.001,
    };

    PedestrianRoutingAdapter.getPedestrianRoute(activeSpot.coordinates, destCoords).then((result) => {
      if (isCancelled || !routeGroupRef.current) return;

      routeGroupRef.current.clearLayers();

      // Outer Illuminated Corridor Glow
      L.polyline(result.coordinates, {
        color: '#86EFAC',
        weight: 9,
        opacity: 0.5,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeGroupRef.current);

      // Core Safe Walk Pulsing Dashed Polyline
      L.polyline(result.coordinates, {
        color: '#16A34A',
        weight: 5,
        opacity: 0.95,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeGroupRef.current);
    });

    return () => {
      isCancelled = true;
    };
  }, [activeRoute, selectedLocation, selectedDestination, locations]);

  // 7. Render Municipal Lighting Heatmaps
  useEffect(() => {
    if (!mapInstanceRef.current || !lightingGroupRef.current) return;

    lightingGroupRef.current.clearLayers();

    if (!showLightingHeatmap) return;

    locations.forEach((loc) => {
      L.circle([loc.coordinates.lat, loc.coordinates.lng], {
        radius: 80,
        color: '#F59E0B',
        fillColor: '#FDE68A',
        fillOpacity: 0.22,
        weight: 1,
        interactive: false,
      }).addTo(lightingGroupRef.current!);
    });
  }, [showLightingHeatmap, locations]);

  // 8. "Locate Me" Handler: GPS Search & Re-center
  const handleLocateMe = useCallback(() => {
    setIsLocating(true);

    if (!navigator.geolocation) {
      showToast('⚠️ Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setDeviceCoordinates(coords);
        setDeviceAccuracy(pos.coords.accuracy || 20);
        setIsLocating(false);

        isProgrammaticFlightRef.current = true;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 16, {
            animate: true,
            duration: 1.2,
          });
        }
        setTimeout(() => {
          isProgrammaticFlightRef.current = false;
        }, 1500);

        // Auto-load nearby spots around current location
        setSelectedDestination({
          id: 'gps-current-location',
          name: 'Current Location',
          address: 'San Francisco, CA',
          coordinates: coords,
        });

        showToast('📍 Centered on your current GPS location.');
      },
      (err) => {
        setIsLocating(false);
        showToast('⚠️ GPS location access was denied. Showing downtown SF.');
        isProgrammaticFlightRef.current = true;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([37.7842, -122.4015], 16, { animate: true, duration: 1.0 });
        }
        setTimeout(() => {
          isProgrammaticFlightRef.current = false;
        }, 1500);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [setSelectedDestination, showToast]);

  return (
    <div
      role="region"
      aria-label="San Francisco Interactive Safety Map"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 0,
        overflow: 'hidden',
        touchAction: 'pan-x pan-y pinch-zoom',
      }}
    >
      {/* Real Leaflet Map DOM Node */}
      <div
        ref={mapContainerRef}
        id="safepark-map"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#E2E8F0',
        }}
      />

      {/* Floating Glassmorphic Map Controls (Right Side) */}
      <aside
        aria-label="Map Visual Controls"
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 110px)',
          right: '14px',
          zIndex: 25,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'auto',
        }}
      >
        {/* Locate Me / GPS Button */}
        <button
          onClick={handleLocateMe}
          aria-label="Locate Me (Current GPS Position)"
          title="Locate Me & Find Nearby Parking"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            backgroundColor: isLocating ? '#EFF6FF' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1.5px solid ${isLocating ? '#2563EB' : '#CBD5E1'}`,
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563EB',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <LocateFixed size={21} style={{ animation: isLocating ? 'spin 1s linear infinite' : 'none' }} />
        </button>

        {/* Lighting Grid Heatmap Toggle */}
        <button
          onClick={() => setShowLightingHeatmap((prev) => !prev)}
          aria-label={showLightingHeatmap ? 'Hide lighting heatmap' : 'Show lighting heatmap'}
          title="Toggle Municipal Lighting Grid"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            backgroundColor: showLightingHeatmap ? '#FEF3C7' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1.5px solid ${showLightingHeatmap ? '#F59E0B' : '#CBD5E1'}`,
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: showLightingHeatmap ? '#B45309' : '#64748B',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Sun size={21} />
        </button>
      </aside>

      {/* Floating Top Return Walk Active HUD Card */}
      {activeRoute && activeRoute.mode === 'safe_walk_return' && (
        <div
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 98px)',
            left: '16px',
            right: '16px',
            zIndex: 35,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            boxShadow: '0 8px 32px rgba(15, 23, 42, 0.45)',
            border: '1.5px solid rgba(16, 185, 129, 0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#065F46',
                border: '1.5px solid #10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#34D399',
              }}
            >
              <Footprints size={18} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#F8FAFC' }}>
                  Return Walk Active
                </span>
                <span
                  style={{
                    backgroundColor: '#065F46',
                    color: '#6EE7B7',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    border: '1px solid #059669',
                  }}
                >
                  ILLUMINATED
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#CBD5E1',
                  fontWeight: 600,
                  marginTop: '1px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {activeRoute.distanceText} • {activeRoute.durationText} to your car ({activeRoute.destinationName})
              </div>
            </div>
          </div>
          <button
            onClick={clearActiveRoute}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#F8FAFC',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              padding: '6px 11px',
              borderRadius: '10px',
              fontSize: '0.725rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
            }}
          >
            <X size={13} />
            <span>Exit Route</span>
          </button>
        </div>
      )}

      {/* Floating Top Parked Vehicle Banner ("Find My Car" Radar Pill) */}
      {activeParkedSession && (!activeRoute || activeRoute.mode !== 'safe_walk_return') && (
        <div
          onClick={() => {
            isProgrammaticFlightRef.current = true;
            mapInstanceRef.current?.flyTo(
              [activeParkedSession.coordinates.lat, activeParkedSession.coordinates.lng],
              17,
              { animate: true, duration: 1.2 }
            );
            const matched = locations.find((l) => l.id === activeParkedSession.locationId);
            if (matched) setSelectedLocation(matched);
          }}
          role="button"
          tabIndex={0}
          aria-label={`View parked vehicle at ${activeParkedSession.spotName}`}
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 98px)',
            left: '16px',
            right: '68px',
            zIndex: 25,
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            borderRadius: '14px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.35)',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            cursor: 'pointer',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: '1.1rem' }}>🚗</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '0.775rem',
                  fontWeight: 800,
                  color: '#F8FAFC',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                Parked: {activeParkedSession.spotName}
              </div>
              <div style={{ fontSize: '0.675rem', color: '#94A3B8', fontWeight: 600 }}>
                Tap to re-center • Return walk ready
              </div>
            </div>
          </div>
          <span
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              padding: '3px 8px',
              borderRadius: '8px',
              fontSize: '0.675rem',
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            Find My Car
          </span>
        </div>
      )}
    </div>
  );
};
