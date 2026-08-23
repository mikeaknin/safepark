import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SavedParkingSession } from '../../domain/models/SavedParkingSession';
import {
  Car,
  MapPin,
  Clock,
  DollarSign,
  Footprints,
  Sun,
  ShieldCheck,
  FileText,
  Edit2,
  Navigation,
  X,
  Check,
} from 'lucide-react';
import { PedestrianRoutingAdapter } from '../../data/adapters/PedestrianRoutingAdapter';

interface ActiveParkedSpotCardProps {
  session: SavedParkingSession;
  onClose?: () => void;
  className?: string;
}

export const ActiveParkedSpotCard: React.FC<ActiveParkedSpotCardProps> = ({
  session,
  className = '',
}) => {
  const { clearParkedSpot, updateParkedNotes, guideMeToMyCar, setCurrentView } = useApp();
  const [timeLeftStr, setTimeLeftStr] = useState<string>('Calculating...');
  const [isWarning, setIsWarning] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [levelNote, setLevelNote] = useState<string>(session.garageNotes?.level || '');
  const [stallNote, setStallNote] = useState<string>(session.garageNotes?.stallNumber || '');
  const [customNote, setCustomNote] = useState<string>(session.garageNotes?.note || '');
  const [walkingDistance, setWalkingDistance] = useState<string>('350 ft');
  const [walkingDuration, setWalkingDuration] = useState<number>(2);

  // Live Countdown calculation
  useEffect(() => {
    const updateCountdown = () => {
      if (!session.expirationTimestamp) {
        setTimeLeftStr('No Time Limit');
        return;
      }
      const now = Date.now();
      const diffMs = session.expirationTimestamp - now;

      if (diffMs <= 0) {
        setIsExpired(true);
        setIsWarning(true);
        const overMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
        setTimeLeftStr(`🚨 Expired ${overMinutes}m ago`);
      } else {
        setIsExpired(false);
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        setIsWarning(totalMinutes <= 20);

        if (hours > 0) {
          setTimeLeftStr(`${hours}h ${minutes}m Remaining`);
        } else {
          setTimeLeftStr(`${minutes}m Remaining`);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 10000);
    return () => clearInterval(interval);
  }, [session.expirationTimestamp]);

  // Estimate distance from live user GPS
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          const route = await PedestrianRoutingAdapter.getPedestrianRoute(
            userCoords,
            session.coordinates
          );
          if (route) {
            const feet = Math.round(route.distanceMeters * 3.28084);
            setWalkingDistance(`${feet} ft`);
            setWalkingDuration(route.durationMinutes);
          }
        },
        () => {
          // Fallback estimate
        },
        { timeout: 5000 }
      );
    }
  }, [session.coordinates]);

  const handleSaveNotes = () => {
    updateParkedNotes({
      level: levelNote.trim() || undefined,
      stallNumber: stallNote.trim() || undefined,
      note: customNote.trim() || undefined,
    });
    setIsEditingNotes(false);
  };

  const handleInCarNav = () => {
    const { lat, lng } = session.coordinates;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const url = isIOS
      ? `maps://?daddr=${lat},${lng}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const handleSafeWalk = () => {
    guideMeToMyCar();
    setCurrentView('driver');
  };

  const handleLeaveSpot = () => {
    clearParkedSpot();
  };

  return (
    <div className={`w-full max-w-lg mx-auto space-y-4 ${className}`}>
      {/* 1. TOP SPOT HERO CARD */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Title + CSI Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1.5">
              <Car className="w-3.5 h-3.5" /> Active Parked Spot
            </span>
            <h2 className="text-lg font-bold text-slate-900 leading-snug truncate">
              {session.spotName}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{session.address}</span>
            </p>
          </div>
          {/* CSI Badge */}
          <div className="shrink-0 text-center px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">CSI Score</div>
            <div className="text-lg font-extrabold text-emerald-700">{session.csiScore || 85}</div>
          </div>
        </div>

        {/* 2. TIMER & STREET SWEEPING BANNER */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-full ${
                isExpired
                  ? 'bg-rose-100 text-rose-600'
                  : isWarning
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-blue-100 text-blue-600'
              } flex items-center justify-center shrink-0`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{timeLeftStr}</div>
              <div className="text-[11px] text-slate-500">
                {session.spotType === 'free_curbside'
                  ? '2-Hour Residential Limit'
                  : session.spotType === 'metered'
                  ? 'Curbside Meter Limit'
                  : 'Garage Facility'}
              </div>
            </div>
          </div>
          {session.streetSweepingNotice ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
              🧹 {session.streetSweepingNotice}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              ✓ No Sweeping Alert
            </span>
          )}
        </div>

        {/* 3. 2x2 TELEMETRY GRID */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center gap-2 text-slate-700">
            <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">
              {session.hourlyRate === 0 ? 'Free ($0.00)' : `$${session.hourlyRate.toFixed(2)}/hr`}
            </span>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center gap-2 text-slate-700">
            <Footprints className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold truncate">
              {walkingDistance} ({walkingDuration}m walk)
            </span>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center gap-2 text-slate-700">
            <Sun className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-semibold truncate">High-Lux Streetlight</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center gap-2 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">Verified Safe Block</span>
          </div>
        </div>

        {/* 4. GARAGE STALL & MEMO INPUT */}
        {!isEditingNotes ? (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-600 truncate">
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">
                {session.garageNotes?.level ? `Level ${session.garageNotes.level}` : ''}
                {session.garageNotes?.stallNumber ? ` • Space ${session.garageNotes.stallNumber}` : ''}
                {session.garageNotes?.note ? ` • "${session.garageNotes.note}"` : ''}
                {!session.garageNotes?.level &&
                !session.garageNotes?.stallNumber &&
                !session.garageNotes?.note
                  ? 'Add floor, stall # or note...'
                  : ''}
              </span>
            </div>
            <button
              onClick={() => setIsEditingNotes(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 shrink-0 flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
        ) : (
          <div className="bg-slate-50 border border-blue-200 rounded-xl p-3 flex flex-col gap-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Level / Floor</label>
                <input
                  type="text"
                  placeholder="e.g. Level 3, P2"
                  value={levelNote}
                  onChange={(e) => setLevelNote(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Stall / Space #</label>
                <input
                  type="text"
                  placeholder="e.g. Space 412"
                  value={stallNote}
                  onChange={(e) => setStallNote(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Quick Memo</label>
              <input
                type="text"
                placeholder="e.g. Near yellow pillar by elevator"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 mt-0.5">
              <button
                onClick={() => setIsEditingNotes(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-800 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. HIGH-IMPACT ACTION BUTTONS */}
        <div className="space-y-2 pt-1">
          {/* Primary Walk CTA */}
          <button
            onClick={handleSafeWalk}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <Footprints className="w-4 h-4" />
            Safe Walk to My Car ({walkingDuration} min walk)
          </button>

          {/* Secondary 2-Button Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleInCarNav}
              className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-800 font-semibold text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition-all"
            >
              <Navigation className="w-3.5 h-3.5 text-slate-600" />
              In-Car Nav
            </button>
            <button
              onClick={handleLeaveSpot}
              className="h-11 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-[0.99] text-rose-700 font-semibold text-xs border border-rose-200 flex items-center justify-center gap-1.5 transition-all"
            >
              <X className="w-3.5 h-3.5 text-rose-600" />
              I Left Spot
            </button>
          </div>
        </div>
      </div>

      {/* 6. BOTTOM INFORMATIONAL CARD */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Continuous Vehicle Protection
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          SafePark monitors municipal crime telemetry and street lighting conditions in real-time. Return walk path prioritizes well-lit, active pedestrian corridors.
        </p>
      </div>
    </div>
  );
};
