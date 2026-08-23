import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SavedParkingSession } from '../../domain/models/SavedParkingSession';
import {
  Car,
  Navigation,
  Footprints,
  Clock,
  X,
  Check,
  Edit2,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { PedestrianRoutingAdapter } from '../../data/adapters/PedestrianRoutingAdapter';
import { getStatusStyle } from '../../theme/tokens';

interface ActiveParkedSpotCardProps {
  session: SavedParkingSession;
  onClose?: () => void;
  className?: string;
}

export const ActiveParkedSpotCard: React.FC<ActiveParkedSpotCardProps> = ({
  session,
  className = '',
}) => {
  const { clearParkedSpot, updateParkedNotes, guideMeToMyCar, setCurrentView, showToast } = useApp();
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [isWarning, setIsWarning] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [levelNote, setLevelNote] = useState<string>(session.garageNotes?.level || '');
  const [stallNote, setStallNote] = useState<string>(session.garageNotes?.stallNumber || '');
  const [customNote, setCustomNote] = useState<string>(session.garageNotes?.note || '');
  const [walkingDistance, setWalkingDistance] = useState<string>('350 ft');
  const [walkingDuration, setWalkingDuration] = useState<number>(2);

  const status = getStatusStyle(session.csiScore);

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
          setTimeLeftStr(`⏱️ ${hours}h ${minutes}m Remaining`);
        } else {
          setTimeLeftStr(`⏱️ ${minutes}m Remaining`);
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

  const handleOpenNav = () => {
    const { lat, lng } = session.coordinates;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const url = isIOS
      ? `maps://?daddr=${lat},${lng}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const handleTriggerSafeWalk = () => {
    guideMeToMyCar();
    setCurrentView('driver');
  };

  return (
    <div
      className={`w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col gap-4 ${className}`}
      style={{
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
      }}
    >
      {/* 1. Header Row: Spot Title & Address (Left) + CSI Badge (Right) */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <h2 className="text-lg font-bold text-slate-900 leading-snug break-words">
              {session.spotName}
            </h2>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin size={13} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{session.address}</span>
          </p>
        </div>

        {/* CSI Score Badge */}
        <div
          style={{
            backgroundColor: status.bg,
            color: status.text,
            border: `1px solid ${status.border}`,
            borderRadius: '12px',
            padding: '4px 12px',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
            {status.label}
          </div>
          <div className="tabular-nums font-bold text-base leading-none mt-0.5">
            CSI {session.csiScore}
          </div>
        </div>
      </div>

      {/* 2. Timer & Alert Banner */}
      <div
        className={`rounded-xl p-3 flex items-center justify-between gap-2 text-xs font-bold border ${
          isExpired
            ? 'bg-rose-50 border-rose-200 text-rose-800 animate-pulse'
            : isWarning
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <Clock size={16} className={isExpired ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'} />
          <span>{timeLeftStr}</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${
            isExpired
              ? 'bg-rose-600 text-white'
              : isWarning
              ? 'bg-amber-500 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {session.spotType === 'free_curbside' ? '2-Hr Zone' : session.spotType === 'metered' ? 'Meter' : 'Garage'}
        </span>
      </div>

      {/* Street Sweeping Notice Banner (if active) */}
      {session.streetSweepingNotice && (
        <div className="flex items-center gap-2 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-xl px-3 py-2 text-xs font-semibold">
          <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
          <span>{session.streetSweepingNotice}</span>
        </div>
      )}

      {/* 3. 2x2 Feature Badge Grid (Identical to Safe Garages) */}
      <div
        style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '12px',
          border: '1px solid #F1F5F9',
          padding: '10px 12px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          fontSize: '0.75rem',
          color: '#334155',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} color="#2563EB" />
          <span style={{ fontWeight: 600 }}>
            {session.hourlyRate === 0 ? 'Free Parking ($0.00)' : `$${session.hourlyRate.toFixed(2)}/hr Rate`}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Footprints size={14} color="#15803D" />
          <span style={{ fontWeight: 600 }}>
            {walkingDistance} ({walkingDuration}m walk)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Lightbulb size={14} color="#F59E0B" />
          <span style={{ fontWeight: 600 }}>High-Lux Streetlight</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#15803D" />
          <span style={{ fontWeight: 600 }}>Verified Safe Zone</span>
        </div>
      </div>

      {/* 4. Garage Stall / Location Memo Card */}
      {!isEditingNotes ? (
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-600 overflow-hidden">
            <span className="font-bold text-slate-800 flex-shrink-0">Spot Memo:</span>
            <span className="truncate text-slate-600 font-medium">
              {session.garageNotes?.level ? `Level ${session.garageNotes.level}` : ''}
              {session.garageNotes?.stallNumber ? ` • Space ${session.garageNotes.stallNumber}` : ''}
              {session.garageNotes?.note ? ` • "${session.garageNotes.note}"` : ''}
              {!session.garageNotes?.level && !session.garageNotes?.stallNumber && !session.garageNotes?.note
                ? 'Add level, stall # or note'
                : ''}
            </span>
          </div>
          <button
            onClick={() => setIsEditingNotes(true)}
            className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 flex-shrink-0 ml-2 py-1 px-1.5 rounded"
            aria-label="Edit parking location notes"
          >
            <Edit2 size={13} />
            <span>Edit</span>
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
              <Check size={13} />
              <span>Save</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. High-Impact Ergonomic Action Buttons */}
      <div className="flex flex-col gap-2 pt-1">
        {/* Primary CTA (Full Width) */}
        <button
          onClick={handleTriggerSafeWalk}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all"
          style={{ minHeight: '48px' }}
        >
          <Footprints size={18} />
          <span>Safe Walk to My Car ({walkingDuration} min walk)</span>
        </button>

        {/* Secondary Action Row */}
        <div className="flex gap-2">
          <button
            onClick={handleOpenNav}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl py-2.5 px-3 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
            style={{ minHeight: '44px' }}
          >
            <Navigation size={14} className="text-blue-600" />
            <span>In-Car Nav</span>
          </button>

          <button
            onClick={clearParkedSpot}
            className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl py-2.5 px-3 font-semibold text-xs flex items-center justify-center gap-1.5 border border-rose-200 transition-colors"
            style={{ minHeight: '44px' }}
          >
            <X size={14} />
            <span>Leave Spot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
