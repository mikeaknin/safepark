import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Car,
  MapPin,
  ShieldCheck,
  Clock,
  Navigation,
  Footprints,
  AlertTriangle,
  X,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useVehicle } from '../../context/VehicleContext';

interface MyCarViewProps {
  onNavigateToExplore: () => void;
}

const DURATION_CHIPS: Array<{ label: string; minutes: number }> = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '2h', minutes: 120 },
  { label: '4h', minutes: 240 },
  { label: 'All Day', minutes: 720 },
];

export const MyCarView: React.FC<MyCarViewProps> = ({ onNavigateToExplore }) => {
  const { clearParkedSpot, activeParkedSession } = useApp();
  const {
    activeVehicle,
    remainingMinutes,
    remainingSeconds,
    remainingTimeFormatted,
    totalDurationMinutes,
    progressPercent,
    isExpired,
    isWarning,
    endParkingSession,
    updateDurationMinutes,
  } = useVehicle();

  // Unified active vehicle info
  const vehicle = activeVehicle || (activeParkedSession ? {
    spotId: activeParkedSession.locationId,
    name: activeParkedSession.spotName,
    lat: activeParkedSession.coordinates.lat,
    lon: activeParkedSession.coordinates.lng,
    parkedAt: activeParkedSession.parkedAtTimestamp,
    meterDurationMinutes: 120,
    blockType: activeParkedSession.spotType,
    address: activeParkedSession.address,
    csiScore: activeParkedSession.csiScore || 85,
    streetSweepingNotice: 'Tue 2:00 AM - 6:00 AM',
  } : null);

  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);

  // Initialize focused mini-map showing the car's pinned location with a walking icon
  useEffect(() => {
    if (!vehicle || !miniMapContainerRef.current) return;

    if (miniMapInstanceRef.current) {
      miniMapInstanceRef.current.remove();
      miniMapInstanceRef.current = null;
    }

    const carLat = vehicle.lat;
    const carLon = vehicle.lon;

    const map = L.map(miniMapContainerRef.current, {
      center: [carLat, carLon],
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Car Pin with Pulsating Ring Beacon
    const carIcon = L.divIcon({
      className: 'safepark-mycar-pin',
      html: `
        <div style="position: relative; width: 38px; height: 38px; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: -10px; border-radius: 50%; border: 2.5px solid #3B82F6; animation: safepark-radar-pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></div>
          <div style="width: 36px; height: 36px; border-radius: 50%; background: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(37,99,235,0.5); display: flex; align-items: center; justify-content: center; font-size: 18px;">
            🚗
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    L.marker([carLat, carLon], { icon: carIcon, zIndexOffset: 2000 }).addTo(map);

    // Walking icon marker representing pedestrian return origin
    const walkingLat = carLat - 0.0012;
    const walkingLon = carLon - 0.0008;

    const walkerIcon = L.divIcon({
      className: 'safepark-walker-pin',
      html: `
        <div style="position: relative; width: 30px; height: 30px; transform: translate(-50%, -50%); background: #10B981; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 2px 10px rgba(16,185,129,0.5); display: flex; align-items: center; justify-content: center; font-size: 15px;">
          🚶
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    L.marker([walkingLat, walkingLon], { icon: walkerIcon, zIndexOffset: 1500 }).addTo(map);

    // Dashed walking path between pedestrian and car
    L.polyline(
      [
        [walkingLat, walkingLon],
        [walkingLat + 0.0006, walkingLon],
        [carLat, carLon],
      ],
      {
        color: '#10B981',
        weight: 3.5,
        dashArray: '6, 6',
        opacity: 0.85,
        lineCap: 'round',
      }
    ).addTo(map);

    miniMapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, [vehicle]);

  const handleEndSession = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
    endParkingSession();
    clearParkedSpot();
  };

  // SVG Circular progress ring calculations
  // Radius: 68px, circumference: 2 * Math.PI * 68 = ~427.26
  const radius = 68;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(100, Math.max(0, progressPercent)) / 100);

  const ringColor = isExpired ? '#EF4444' : isWarning ? '#F59E0B' : '#2563EB';

  return (
    <div className="min-h-screen bg-slate-50/60 pt-10 pb-36 px-4">
      <div className="w-full max-w-lg mx-auto space-y-4">
        {/* TOP HEADER */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <Car className="w-3.5 h-3.5" />
            <span>VEHICLE RADAR & METER</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Parked Vehicle
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Live GPS location tracking, 2-hour meter countdowns, and illuminated return walking routes.
          </p>
        </div>

        {/* ACTIVE SESSION OR EMPTY STATE */}
        {vehicle ? (
          <div className="space-y-4">
            {/* HIGH-PRIORITY METER EXPIRATION ALERT BANNER */}
            {isExpired ? (
              <div
                role="alert"
                className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-4 flex items-start gap-3.5 shadow-md animate-pulse"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 text-xl font-black">
                  🚨
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-rose-900 uppercase tracking-tight flex items-center gap-1.5">
                    <span>Meter Expired</span>
                    <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded font-extrabold">
                      CRITICAL ALERT
                    </span>
                  </div>
                  <div className="text-sm font-extrabold text-rose-800 mt-0.5">
                    Your vehicle at {vehicle.name} has exceeded the meter limit.
                  </div>
                  <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                    Return to your car immediately to avoid an $85+ municipal citation or towing.
                  </p>
                </div>
              </div>
            ) : isWarning ? (
              <div
                role="alert"
                className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex items-start gap-3.5 shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 text-xl font-black">
                  ⚠️
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-amber-950 uppercase tracking-tight flex items-center gap-1.5">
                    <span>Meter Expiring Soon ({remainingMinutes}m remaining)</span>
                    <span className="bg-amber-400 text-amber-950 text-[10px] px-1.5 py-0.5 rounded font-extrabold">
                      15-MIN WARNING
                    </span>
                  </div>
                  <div className="text-sm font-bold text-amber-900 mt-0.5">
                    Your vehicle at {vehicle.name} will exceed the meter limit shortly.
                  </div>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Return to your car to avoid a parking ticket, or extend your meter limit below.
                  </p>
                </div>
              </div>
            ) : null}

            {/* LIVE CIRCULAR COUNTDOWN PROGRESS RING CARD */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col items-center text-center">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Meter Expiration Countdown</span>
              </div>

              {/* Circular SVG Ring */}
              <div className="relative w-44 h-44 flex items-center justify-center my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  {/* Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#E2E8F0"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {/* Animated Progress Stroke */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease',
                    }}
                  />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span
                    className={`text-2xl font-black tracking-tight ${
                      isExpired ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-slate-900'
                    }`}
                  >
                    {remainingTimeFormatted}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mt-0.5">
                    {isExpired ? 'Meter Expired' : 'Remaining'}
                  </span>
                  <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    {vehicle.meterDurationMinutes || 120}-Min Limit
                  </span>
                </div>
              </div>

              {/* Progress Summary Pill */}
              <div className="mt-3 text-xs text-slate-500 font-medium">
                {isExpired ? (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Meter time has ended. Return to vehicle to avoid citation.
                  </span>
                ) : (
                  <span>
                    Parked at {new Date(vehicle.parkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Active tracking
                  </span>
                )}
              </div>

              {/* Quick Duration Extension Chips */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 w-full">
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
                  Adjust Meter Duration Limit
                </div>
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {DURATION_CHIPS.map((chip) => {
                    const isSelected = (vehicle.meterDurationMinutes || 120) === chip.minutes;
                    return (
                      <button
                        key={chip.minutes}
                        onClick={() => updateDurationMinutes(chip.minutes)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm scale-105'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                        }`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* STREET CLEANING WARNING BANNER */}
            <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-800 text-xl">
                🧹
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-amber-950 uppercase tracking-tight flex items-center gap-1.5">
                  <span>Street Cleaning Warning</span>
                  <span className="bg-amber-200/80 text-amber-900 text-[10px] px-1.5 py-0.2 rounded font-extrabold">
                    MANDATORY MOVE
                  </span>
                </div>
                <div className="text-xs text-amber-900 font-semibold mt-0.5 leading-snug">
                  {vehicle.streetSweepingNotice || 'Tue 2:00 AM - 6:00 AM'}
                </div>
                <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                  Move your vehicle prior to street sweeping to avoid an automatic $85 municipal citation.
                </p>
              </div>
            </div>

            {/* FOCUSED MINI-MAP SHOWING CAR LOCATION WITH WALKING ICON */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Pinned Vehicle Location
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{vehicle.csiScore || 85} CSI Safety Score</span>
                </div>
              </div>

              {/* Interactive Mini Leaflet Map */}
              <div className="relative w-full h-52 bg-slate-100">
                <div ref={miniMapContainerRef} className="w-full h-full" />
                {/* Overlay Badge */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-[1000] bg-slate-900/90 backdrop-blur-md rounded-xl p-2.5 text-white shadow-lg border border-white/15 flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="text-xs font-extrabold text-slate-100 truncate">
                      {vehicle.name}
                    </div>
                    <div className="text-[11px] text-slate-300 truncate">
                      {vehicle.address || `${vehicle.name}, CA`}
                    </div>
                  </div>
                  <div className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-600 text-white shrink-0">
                    {vehicle.blockType?.includes('curbside') || vehicle.blockType?.includes('street')
                      ? 'Curbside'
                      : 'Garage'}
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONS: TAKE ME TO MY CAR & END PARKING SESSION */}
            <div className="space-y-2.5 pt-1">
              <a
                href={`https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=${vehicle.lat},${vehicle.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                    try {
                      navigator.vibrate(10);
                    } catch {}
                  }
                }}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer no-underline"
                style={{ touchAction: 'manipulation' }}
              >
                <Footprints className="w-4 h-4" />
                <span>Take Me to My Car</span>
              </a>

              <button
                onClick={handleEndSession}
                className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-700 font-bold text-xs border border-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                style={{ touchAction: 'manipulation' }}
              >
                <X className="w-4 h-4 text-slate-500" />
                <span>End Parking Session</span>
              </button>
            </div>
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
              <Car className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-xs mx-auto">
              <h2 className="text-lg font-bold text-slate-900">
                No Vehicle Currently Tracked
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                When you park at any street curb, 2-hour residential zone, or garage, tap{' '}
                <span className="font-bold text-slate-800">"Parked Here"</span> on the map to start live tracking with meter alerts.
              </p>
            </div>

            <button
              onClick={onNavigateToExplore}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              style={{ touchAction: 'manipulation' }}
            >
              <Navigation className="w-4 h-4" />
              <span>Find Safe Parking on Map</span>
            </button>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-[11px] font-semibold text-slate-700">2-Hr Timers</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                <Compass className="w-4 h-4 text-blue-600" />
                <span className="text-[11px] font-semibold text-slate-700">GPS Radar</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                <Footprints className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-semibold text-slate-700">Safe Walk</span>
              </div>
            </div>
          </div>
        )}

        {/* SAFEGUARD FOOTER */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-600 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Automated Safety Monitoring
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              SafePark tracks real-time break-in telemetry and street lighting grids to safeguard your parked spot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
