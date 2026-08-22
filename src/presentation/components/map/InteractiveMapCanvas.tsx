import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import { ParkingLocation } from '../../../domain/models/ParkingLocation';
import { getStatusStyle, SAFE_PARK_TOKENS } from '../../../theme/tokens';
import {
  LocateFixed,
  Sun,
  Moon,
  Layers,
  Sparkles,
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
    showLightingHeatmap,
    setShowLightingHeatmap,
    parkedLocation,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routeGroupRef = useRef<L.LayerGroup | null>(null);
  const lightingGroupRef = useRef<L.LayerGroup | null>(null);

  const [deviceCoordinates, setDeviceCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 37.7812,
    lng: -122.4001,
  });

  // 1. Initialize Real Slippy Leaflet Tile Map
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

    // High-resolution Daylight Carto Voyager Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    // Initialize Layer Groups for markers, safe walk route, and lighting
    lightingGroupRef.current = L.layerGroup().addTo(map);
    routeGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Trigger size invalidation to ensure full tile coverage
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Real Panning & Re-Centering on Destination Coordinates Update
  useEffect(() => {
    if (mapInstanceRef.current && selectedDestination?.coordinates) {
      const { lat, lng } = selectedDestination.coordinates;
      mapInstanceRef.current.flyTo([lat, lng], 16, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedDestination]);

  // 3. Live Geolocation Device Tracker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setDeviceCoordinates({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation fallback:', err.message);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // 4. Render Markers (Destination Pin + Parking Facilities)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    // A. Render Destination Pin (if selected)
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

    // B. Render Parking Facility Pins with Real Lat/Lng & CSI Styling
    locations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const isParked = parkedLocation?.id === loc.id;
      const status = getStatusStyle(loc.csi.totalScore);

      let pinBg = '#ECFDF5';
      let pinText = '#15803D';
      let pinBorder = '#86EFAC';
      let badgeIcon = '🛡️';

      if (loc.csi.totalScore < 50) {
        pinBg = '#FFF1F2';
        pinText = '#BE123C';
        pinBorder = '#FECDD3';
        badgeIcon = '🚨';
      } else if (loc.csi.totalScore < 75) {
        pinBg = '#FFFBEB';
        pinText = '#B45309';
        pinBorder = '#FDE68A';
        badgeIcon = '⚠️';
      }

      const parkingIcon = L.divIcon({
        className: `safepark-pin-${loc.id}`,
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer; transition: transform 0.15s ease;">
            ${
              isParked
                ? `<div style="background-color: #15803D; color: #FFFFFF; font-size: 0.6rem; font-weight: 800; padding: 1px 6px; border-radius: 9999px; margin-bottom: 2px; box-shadow: 0 2px 6px rgba(21,128,61,0.4); text-transform: uppercase;">Active Spot</div>`
                : ''
            }
            <div style="background-color: ${pinBg}; color: ${pinText}; border: ${
          isSelected ? '2px solid #2563EB' : `1.5px solid ${pinBorder}`
        }; border-radius: 12px; padding: 4px 8px; font-size: 0.75rem; font-weight: 800; white-space: nowrap; box-shadow: ${
          isSelected
            ? '0 0 0 3px rgba(37,99,235,0.3), 0 6px 18px rgba(15,23,42,0.2)'
            : '0 2px 10px rgba(15,23,42,0.12)'
        }; display: flex; align-items: center; gap: 5px;">
              <span>${badgeIcon} CSI ${loc.csi.totalScore}</span>
              <span style="opacity: 0.5;">•</span>
              <span>$${loc.hourlyRate.toFixed(0)}/hr</span>
            </div>
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${
              isSelected ? '#2563EB' : pinBorder
            }; margin-top: -1px;"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([loc.coordinates.lat, loc.coordinates.lng], {
        icon: parkingIcon,
        zIndexOffset: isSelected ? 500 : isParked ? 600 : 100,
      });

      marker.on('click', () => {
        setSelectedLocation(loc);
      });

      marker.addTo(markersGroupRef.current!);
    });
  }, [locations, selectedLocation, selectedDestination, parkedLocation, setSelectedLocation]);

  // 5. Render Safe Walk Illuminated Polyline
  useEffect(() => {
    if (!mapInstanceRef.current || !routeGroupRef.current) return;

    routeGroupRef.current.clearLayers();

    const activeSpot = selectedLocation || locations[0];
    if (!activeSpot || !selectedDestination?.coordinates) return;

    const startLat = activeSpot.coordinates.lat;
    const startLng = activeSpot.coordinates.lng;
    const endLat = selectedDestination.coordinates.lat;
    const endLng = selectedDestination.coordinates.lng;

    // Build realistic street grid corridor path
    const cornerWaypoint: [number, number] = [startLat + (endLat - startLat) * 0.65, startLng];
    const waypoints: [number, number][] = [
      [startLat, startLng],
      cornerWaypoint,
      [endLat, endLng],
    ];

    // Outer Illuminated Corridor Glow
    L.polyline(waypoints, {
      color: '#86EFAC',
      weight: 9,
      opacity: 0.5,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(routeGroupRef.current);

    // Core Safe Walk Pulsing Dashed Polyline
    L.polyline(waypoints, {
      color: '#16A34A',
      weight: 5,
      opacity: 0.95,
      dashArray: '8, 8',
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(routeGroupRef.current);
  }, [selectedLocation, selectedDestination, locations]);

  // 6. Render Municipal Lighting Heatmaps
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

  // Center / Re-Focus on Destination or User
  const handleRecenter = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const target = selectedDestination?.coordinates || deviceCoordinates;
    mapInstanceRef.current.flyTo([target.lat, target.lng], 16, {
      animate: true,
      duration: 1.0,
    });
  }, [selectedDestination, deviceCoordinates]);

  return (
    <div
      role="region"
      aria-label="San Francisco Interactive Safety Map"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100dvh',
        zIndex: 0,
        overflow: 'hidden',
        touchAction: 'pan-x pan-y pinch-zoom',
      }}
    >
      {/* Real Leaflet Map DOM Node */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#F8FAFC',
        }}
      />

      {/* Floating Map Controls (Right Side) */}
      <aside
        aria-label="Map Visual Controls"
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 72px)',
          right: '14px',
          zIndex: 25,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'auto',
        }}
      >
        {/* Re-center / GPS Trigger */}
        <button
          onClick={handleRecenter}
          aria-label="Re-center map on destination"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid #CBD5E1',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563EB',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
        >
          <LocateFixed size={20} />
        </button>

        {/* Lighting Grid Heatmap Toggle */}
        <button
          onClick={() => setShowLightingHeatmap((prev) => !prev)}
          aria-label={showLightingHeatmap ? 'Hide lighting heatmap' : 'Show lighting heatmap'}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: showLightingHeatmap ? '#FEF3C7' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${showLightingHeatmap ? '#F59E0B' : '#CBD5E1'}`,
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: showLightingHeatmap ? '#B45309' : '#64748B',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Sun size={20} />
        </button>
      </aside>
    </div>
  );
};
