import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SavedParkingSession } from '../../domain/models/SavedParkingSession';
import { Car, Navigation, Footprints, Clock, X, Check, Edit2, ShieldCheck, AlertTriangle } from 'lucide-react';
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
  const { clearParkedSpot, updateParkedNotes, guideMeToMyCar, showToast } = useApp();
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [isWarning, setIsWarning] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [levelNote, setLevelNote] = useState<string>(session.garageNotes?.level || '');
  const [stallNote, setStallNote] = useState<string>(session.garageNotes?.stallNumber || '');
  const [customNote, setCustomNote] = useState<string>(session.garageNotes?.note || '');
  const [walkingDistance, setWalkingDistance] = useState<string | null>(null);
  const [walkingDuration, setWalkingDuration] = useState<number | null>(null);

  // Live Countdown calculation
  useEffect(() => {
    const updateCountdown = () => {
      if (!session.expirationTimestamp) {
        setTimeLeftStr('No limit');
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
          setTimeLeftStr(`⏱️ ${hours}h ${minutes}m remaining`);
        } else {
          setTimeLeftStr(`⏱️ ${minutes}m remaining`);
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
          // Geolocation unavailable or blocked
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

  const handleOpenNav = () => {
    const { lat, lng } = session.coordinates;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const url = isIOS
      ? `maps://?daddr=${lat},${lng}&q=${encodeURIComponent(session.spotName)}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-blue-200 shadow-xl overflow-hidden ${className}`}
      style={{
        boxShadow: '0 8px 30px rgba(37, 99, 235, 0.12), 0 2px 8px rgba(15, 23, 42, 0.08)',
      }}
    >
      {/* Top Banner: Parked Status & Expiration Countdown */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Car size={14} className="text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">Active Parked Vehicle</span>
        </div>

        <div
          className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
            isExpired
              ? 'bg-rose-500 text-white animate-pulse'
              : isWarning
              ? 'bg-amber-400 text-slate-900 font-black'
              : 'bg-white/20 text-white'
          }`}
        >
          {timeLeftStr}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 flex flex-col gap-3">
        {/* Full Spot Title & CSI Badge */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-slate-900 leading-snug break-words">
              {session.spotName}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">{session.address}</p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg text-xs font-black">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>CSI {session.csiScore}</span>
          </div>
        </div>

        {/* Live Distance & Walking Duration Telemetry */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-bold text-blue-600">
            <Footprints size={15} />
            <span>{walkingDistance ? `${walkingDistance} to car` : 'Nearby'}</span>
          </div>
          {walkingDuration !== null && (
            <>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-emerald-700">
                {walkingDuration} min illuminated return walk
              </span>
            </>
          )}
          {session.hourlyRate === 0 && (
            <>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-emerald-600">Free ($0.00)</span>
            </>
          )}
        </div>

        {/* Street Sweeping / Municipal Notice */}
        {session.streetSweepingNotice && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-3 py-2 text-xs font-semibold">
            <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
            <span>{session.streetSweepingNotice}</span>
          </div>
        )}

        {/* Vehicle Notes / Stall Info */}
        {!isEditingNotes ? (
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600 overflow-hidden">
              <span className="font-bold text-slate-800">Spot Details:</span>
              <span className="truncate text-slate-500">
                {session.garageNotes?.level ? `Level ${session.garageNotes.level}` : ''}
                {session.garageNotes?.stallNumber ? ` • Stall ${session.garageNotes.stallNumber}` : ''}
                {session.garageNotes?.note ? ` • "${session.garageNotes.note}"` : ''}
                {!session.garageNotes?.level && !session.garageNotes?.stallNumber && !session.garageNotes?.note
                  ? 'No stall notes added'
                  : ''}
              </span>
            </div>
            <button
              onClick={() => setIsEditingNotes(true)}
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 flex-shrink-0 ml-2"
            >
              <Edit2 size={12} />
              <span>Edit</span>
            </button>
          </div>
        ) : (
          <div className="bg-slate-50 border border-blue-200 rounded-xl p-3 flex flex-col gap-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Level / Floor</label>
                <input
                  type="text"
                  placeholder="e.g. P2, 3rd Floor"
                  value={levelNote}
                  onChange={(e) => setLevelNote(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Stall / Spot #</label>
                <input
                  type="text"
                  placeholder="e.g. 412, Blue-B"
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
                placeholder="e.g. Near yellow pillar / elevator"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => setIsEditingNotes(false)}
                className="px-3 py-1 text-slate-600 hover:text-slate-800 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="bg-blue-600 text-white px-3.5 py-1 rounded-lg font-bold flex items-center gap-1 shadow-sm"
              >
                <Check size={12} />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {/* Guide Me to My Car Button */}
          <button
            onClick={guideMeToMyCar}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl py-3 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all"
            style={{ minHeight: '44px' }}
          >
            <Footprints size={18} />
            <span>Guide Me to My Car</span>
          </button>

          {/* Nav & Clear Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleOpenNav}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl py-3 px-3 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
              style={{ minHeight: '44px' }}
            >
              <Navigation size={15} className="text-blue-600" />
              <span>In-Car Nav</span>
            </button>

            <button
              onClick={clearParkedSpot}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl py-3 px-3.5 font-bold text-xs flex items-center justify-center gap-1 border border-rose-200 transition-colors"
              style={{ minHeight: '44px' }}
              title="I Left This Spot"
            >
              <X size={15} />
              <span>I Left Spot</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
