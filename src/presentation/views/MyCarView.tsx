import React from 'react';
import { Car, MapPin, ShieldCheck, Clock, Navigation, Footprints } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveParkedSpotCard } from '../components/ActiveParkedSpotCard';

interface MyCarViewProps {
  onNavigateToExplore?: () => void;
}

export const MyCarView: React.FC<MyCarViewProps> = ({ onNavigateToExplore }) => {
  const { activeParkedSession, clearParkedSpot, setCurrentView } = useApp();
  const handleExplore = onNavigateToExplore || (() => setCurrentView('driver'));

  return (
    <div className="min-h-screen bg-slate-50/50 pt-6 pb-32 px-4">
      <div className="w-full max-w-lg mx-auto space-y-4">
        
        {/* TOP HEADER */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <Car className="w-3.5 h-3.5" />
            <span>VEHICLE RADAR</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Parked Vehicle
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Live GPS location tracking, street sweeping countdowns, and illuminated return walking routes.
          </p>
        </div>

        {/* ACTIVE SESSION OR CLEAN EMPTY STATE */}
        {activeParkedSession ? (
          <ActiveParkedSpotCard 
            session={activeParkedSession} 
            onClear={clearParkedSpot}
            onNavigateToExplore={handleExplore}
          />
        ) : (
          /* EMPTY STATE CARD */
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm text-center space-y-5">
            
            {/* Hero Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-50 to-blue-100 border border-blue-200/80 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
              <Car className="w-8 h-8" />
            </div>

            {/* Heading & Explanation */}
            <div className="space-y-1.5 max-w-xs mx-auto">
              <h2 className="text-lg font-bold text-slate-900">
                No Vehicle Currently Tracked
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                When you park at any street curb, 2-hour residential zone, or garage, tap <span className="font-semibold text-slate-700">"I'm Parked Here"</span> on the map to start live tracking.
              </p>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleExplore}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              Find Safe Parking on Map
            </button>

            {/* Feature Highlights Grid */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-[11px] font-semibold text-slate-700">2-Hr Timers</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-[11px] font-semibold text-slate-700">GPS Radar</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                <Footprints className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-semibold text-slate-700">Safe Walk</span>
              </div>
            </div>

          </div>
        )}

        {/* BOTTOM INFORMATIONAL SAFEGUARD CARD */}
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
