import React, { useState } from 'react';
import { useSafety } from '../contexts/SafetyContext';
import { LeafletMap } from '../components/LeafletMap';
import { Navigation, Clock, ShieldCheck, MapPin, Car, Bike, Footprints, AlertTriangle, CheckCircle2, BellRing, Play } from 'lucide-react';

export const JourneyPage: React.FC = () => {
  const {
    activeJourney,
    startJourney,
    endJourney,
    location,
    guardians,
    checkInIntervalMinutes,
    setCheckInIntervalMinutes,
    triggerCheckInNow
  } = useSafety();

  const [origin, setOrigin] = useState(location.address || 'Current Device Location');
  const [destination, setDestination] = useState(`${location.city || 'Central Area'} City Center`);
  const [mode, setMode] = useState<'cab' | 'auto' | 'walking' | 'metro' | 'driving'>('cab');

  React.useEffect(() => {
    if (location.address) {
      setOrigin(location.address);
    }
    if (location.city) {
      setDestination(`${location.city} City Center`);
    }
  }, [location.address, location.city]);

  const indiaShortcuts = [
    { name: 'T. Nagar, Chennai', lat: 13.0418, lng: 80.2341 },
    { name: 'Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245 },
    { name: 'Connaught Place, Delhi', lat: 28.6315, lng: 77.2167 },
    { name: 'BKC, Mumbai', lat: 19.0657, lng: 72.8687 },
    { name: 'HITECH City, Hyderabad', lat: 17.4435, lng: 78.3772 },
    { name: 'Park Street, Kolkata', lat: 22.5532, lng: 88.3524 }
  ];

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    await startJourney(origin, destination, mode);
  };

  return (
    <div className="p-4 space-y-5 pb-24 text-slate-100 animate-fadeIn">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
          <Navigation className="w-5 h-5 text-purple-400" /> Journey Protection System
        </h2>
        <p className="text-xs text-slate-400">
          Real-time GPS route monitoring, interval safety check-ins & guardian auto-sharing
        </p>
      </div>

      {/* SCHEDULED CHECK-IN INTERVAL CONFIG */}
      <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
            <BellRing className="w-4 h-4 text-purple-400" />
            <span>Scheduled Safety Check-In Prompt</span>
          </div>
          <button
            onClick={triggerCheckInNow}
            className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold flex items-center gap-1 shadow transition-transform active:scale-95"
          >
            <Play className="w-3 h-3" /> Test Prompt
          </button>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Prompt interval while traveling:</span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 5].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setCheckInIntervalMinutes(mins)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  checkInIntervalMinutes === mins
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-slate-900 text-slate-400 border-white/10'
                }`}
              >
                Every {mins} min{mins > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ACTIVE JOURNEY VIEW */}
      {activeJourney ? (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-3xl border border-purple-500/40 bg-purple-950/20 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Live Route Tracking Active
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Safe Route
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">From</span>
                  <span className="font-semibold text-white">{activeJourney.originName}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">To</span>
                  <span className="font-semibold text-white">{activeJourney.destinationName}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Scheduled Check-In</span>
                <span className="font-extrabold text-purple-300 text-sm">Every {checkInIntervalMinutes} mins</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Shared Guardians</span>
                <span className="font-extrabold text-indigo-400 text-sm">{guardians.length} Active</span>
              </div>
            </div>

            <button
              onClick={endJourney}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Arrived Safely — Complete Journey
            </button>
          </div>

          {/* Interactive Map with Route */}
          <LeafletMap
            center={location}
            showRoute={true}
            destinationCoords={{ lat: 12.9352, lng: 77.6245 }}
            height="260px"
          />
        </div>
      ) : (
        /* START JOURNEY FORM */
        <form onSubmit={handleStart} className="glass-panel p-4 rounded-3xl border border-white/10 space-y-4 shadow-xl">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Starting Origin</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Destination Address</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* India Landmark Quick Shortcuts */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">Quick Indian Destinations:</span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {indiaShortcuts.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setDestination(s.name)}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-white border border-white/10 text-[10px] shrink-0 font-medium transition-colors"
                  >
                    📍 {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Mode Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Mode of Travel</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'cab', label: 'Cab', icon: Car },
                  { id: 'auto', label: 'Auto', icon: Bike },
                  { id: 'walking', label: 'Walk', icon: Footprints },
                  { id: 'metro', label: 'Metro', icon: Navigation },
                  { id: 'driving', label: 'Self', icon: Car }
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id as any)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${isSelected ? 'bg-purple-600 text-white border-purple-400 shadow-md' : 'bg-slate-900 text-slate-400 border-white/10'}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 text-white font-extrabold text-xs shadow-xl shadow-purple-600/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Start Protected Journey
          </button>
        </form>
      )}

      {/* Journey Safety Tips */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 space-y-1.5">
        <span className="font-bold text-purple-400 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" /> Deviation & Interval Safeguard
        </span>
        <p className="text-[11px] text-slate-400">
          Auralis automatically prompts a check-in every {checkInIntervalMinutes} minutes. Unconfirmed prompts automatically trigger guardian emergency notifications with your live GPS location.
        </p>
      </div>
    </div>
  );
};
