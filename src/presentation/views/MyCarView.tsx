import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveParkedSpotCard } from '../components/ActiveParkedSpotCard';
import { Car, Compass, ShieldCheck, Clock, MapPin, Sparkles, Navigation } from 'lucide-react';

export const MyCarView: React.FC = () => {
  const { activeParkedSession, setCurrentView, guideMeToMyCar } = useApp();

  const handleGuideMe = () => {
    guideMeToMyCar();
    setCurrentView('driver');
  };

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 overflow-y-auto"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}
    >
      <div className="max-w-md mx-auto flex flex-col gap-5">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>🚗 My Parked Car</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {activeParkedSession ? 'Live Location & Return Route' : 'Find My Car & Parking Timers'}
            </p>
          </div>

          {activeParkedSession && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-black animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Active</span>
            </span>
          )}
        </div>

        {activeParkedSession ? (
          /* Active Parked Vehicle View */
          <div className="flex flex-col gap-4">
            <ActiveParkedSpotCard session={activeParkedSession} />

            {/* Quick Map Return Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Compass size={16} className="text-blue-600" />
                <span>Return Walk Assistance</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                SafePark illuminates low-crime, street-lit sidewalks from your current GPS position back to your vehicle at <strong className="text-slate-800">{activeParkedSession.spotName}</strong>.
              </p>
              <button
                onClick={handleGuideMe}
                className="w-full bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                style={{ minHeight: '44px' }}
              >
                <Navigation size={15} className="text-emerald-400" />
                <span>Open Return Map with Safe Walk</span>
              </button>
            </div>

            {/* Safety & Physical Protection Summary */}
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200/80 rounded-2xl p-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-xs uppercase tracking-wider mb-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Continuous Vehicle Surveillance</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Your spot at <strong className="text-slate-900">{activeParkedSession.spotName}</strong> holds a Composite Safety Index score of <strong className="text-emerald-700">CSI {activeParkedSession.csiScore}/100</strong>. Automatic Bluetooth disconnect detection is armed.
              </p>
            </div>
          </div>
        ) : (
          /* Empty State: No Car Parked */
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col items-center text-center gap-4 mt-4">
            <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner relative">
              <Car size={36} />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-black">
                <Sparkles size={12} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 max-w-xs">
              <h2 className="text-lg font-black text-slate-900">
                No Parked Vehicle Tracked
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tap <strong className="text-blue-600">"Park Here"</strong> on any curbside spot, 2-hour zone, or garage in Explore to start tracking your vehicle, set timers, and get illuminated walking directions back.
              </p>
            </div>

            <div className="w-full border-t border-slate-100 pt-4 mt-2 flex flex-col gap-2.5">
              <button
                onClick={() => setCurrentView('driver')}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all"
                style={{ minHeight: '44px' }}
              >
                <Compass size={18} />
                <span>Find Parking on Map</span>
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-semibold pt-1">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> 2-Hr Reminders
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> GPS Radar
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} /> Safe Walk
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
