import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveParkedSpotCard } from '../components/ActiveParkedSpotCard';
import { Car, Compass, Clock, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

export const MyCarView: React.FC = () => {
  const { activeParkedSession, setCurrentView } = useApp();

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-2 pb-28 space-y-4">
      {/* Page Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              activeParkedSession
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>{activeParkedSession ? 'Active Tracking' : 'Vehicle Radar'}</span>
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {activeParkedSession ? 'Live GPS Location Armed' : 'Find My Car & Parking Timers'}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 leading-tight">
          My Parked Vehicle
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Live location, street sweeping alerts, and illuminated return walk.
        </p>
      </div>

      {activeParkedSession ? (
        /* Active Parked Vehicle Layout */
        <ActiveParkedSpotCard session={activeParkedSession} />
      ) : (
        /* Empty State: No Vehicle Tracked */
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 relative">
            <Car className="w-8 h-8" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px]">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          <div className="max-w-xs space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900">
              No Vehicle Currently Tracked
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tap <strong className="text-blue-600 font-semibold">"I'm Parked Here"</strong> on any street curb, 2-hour zone, or garage in Explore to start tracking your vehicle, set timers, and get illuminated walking directions back.
            </p>
          </div>

          <div className="w-full border-t border-slate-100 pt-4 space-y-3">
            <button
              onClick={() => setCurrentView('driver')}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Find Safe Parking on Map</span>
            </button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> 2-Hr Reminders
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> GPS Radar
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Safe Walk
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
