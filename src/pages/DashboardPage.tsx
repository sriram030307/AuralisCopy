import React, { useState } from 'react';
import { useSafety } from '../contexts/SafetyContext';
import { useAuth } from '../contexts/AuthContext';
import { LeafletMap } from '../components/LeafletMap';
import { Shield, Navigation, Phone, PhoneCall, MapPin, AlertTriangle, CloudSun, Activity, ChevronRight, ShieldCheck, X, CheckCircle2 } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tabId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { location, batteryLevel, triggerSOS, nearbyPlaces, activeJourney, gpsStatus, gpsAccuracy, refreshGPSLocation } = useSafety();
  const { user } = useAuth();
  const [isRefreshingGps, setIsRefreshingGps] = useState(false);
  const [showQuickDialModal, setShowQuickDialModal] = useState(false);

  const primaryContactName = user?.primaryContactName || 'Venkatesan Ramanujam';
  const primaryContactPhone = user?.primaryContactPhone || '+91 99404 10516';
  const primaryContactRelation = user?.primaryContactRelation || 'Primary Contact (ICE)';

  const handleRefreshGps = async () => {
    setIsRefreshingGps(true);
    await refreshGPSLocation();
    setIsRefreshingGps(false);
  };

  const handleQuickDialClick = () => {
    setShowQuickDialModal(true);
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'User';

  return (
    <div className="p-4 space-y-4 pb-24 text-slate-100 animate-fadeIn">
      
      {/* 1. Greeting & Safety Score Banner */}
      <div className="glass-panel p-4 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-rose-950/30 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> Live Safety Status
            </span>
            <h2 className="text-xl font-bold font-heading text-white">
              Hello, {displayName} 👋
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              {location.city || 'Local Area'} • {location.address || 'Active Device Location'}
            </p>
          </div>

          {/* Safety Score Radial Badge */}
          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-rose-600/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center">
              <span className="text-lg font-extrabold font-heading text-white leading-none">94</span>
              <span className="text-[8px] uppercase font-bold text-rose-400">Score</span>
            </div>
          </div>
        </div>

        {/* Weather & AQI Mini Bar */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <CloudSun className="w-4 h-4 text-amber-400" />
            <span>27°C • Clear Sky</span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-emerald-400">
            <span>AQI 72 (Good)</span>
          </div>
        </div>
      </div>

      {/* 1.5 Real Device GPS Card with Refresh Button */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 text-xs space-y-2 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Real Device GPS Location
            </span>
          </div>

          <button
            onClick={handleRefreshGps}
            disabled={isRefreshingGps}
            className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] flex items-center gap-1 transition-all active:scale-95"
          >
            <span>{isRefreshingGps ? 'Updating...' : '📍 Update Device GPS'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300 font-mono">
          <div className="bg-slate-950 p-2 rounded-xl border border-white/5">
            <span className="text-[9px] text-slate-400 block font-sans">Latitude / Longitude</span>
            <span className="text-emerald-300 font-bold">{location.latitude.toFixed(5)}°, {location.longitude.toFixed(5)}°</span>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl border border-white/5">
            <span className="text-[9px] text-slate-400 block font-sans">Accuracy / GPS Status</span>
            <span className="text-cyan-300 font-bold">±{location.accuracy || gpsAccuracy || 5}m • {gpsStatus === 'active' ? 'Fixed' : 'Acquiring'}</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
          <span className="truncate pr-2">Address: {location.address}</span>
          <span className="shrink-0 text-slate-500">Updated: {new Date(location.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>

      {/* 2. Active Journey Alert Widget (If active) */}
      {activeJourney && (
        <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-200 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <Navigation className="w-5 h-5 text-purple-400 animate-spin" />
            <div>
              <div className="text-xs font-bold text-white">Journey Protection Active</div>
              <div className="text-[10px] text-purple-300">Tracking to {activeJourney.destinationName}</div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('journey')}
            className="px-2.5 py-1 rounded-xl bg-purple-600 text-white font-bold text-xs"
          >
            View
          </button>
        </div>
      )}

      {/* 3. Emergency Action Controls: Quick SOS & Quick Dial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 3a. Quick SOS Bar */}
        <div className="p-3.5 rounded-3xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 flex items-center justify-between shadow-xl shadow-rose-600/25">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <AlertTriangle className="w-5 h-5 fill-white text-rose-600" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-white">Emergency Quick SOS</h3>
              <p className="text-[10px] text-rose-100">Broadcast live GPS to guardians</p>
            </div>
          </div>

          <button
            onClick={triggerSOS}
            className="px-3.5 py-2 rounded-2xl bg-white text-rose-700 font-extrabold text-xs shadow-md hover:bg-slate-100 transition-transform active:scale-95 shrink-0"
          >
            SOS Now
          </button>
        </div>

        {/* 3b. Dedicated Quick Dial Primary ICE Contact Bar */}
        <div className="p-3.5 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-teal-950/90 border border-emerald-500/40 flex items-center justify-between shadow-xl shadow-emerald-950/40">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <PhoneCall className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="text-xs font-extrabold text-white">Quick Dial ICE</h3>
                <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Primary
                </span>
              </div>
              <p className="text-xs font-bold text-emerald-300 truncate">
                {primaryContactName} <span className="text-[9px] text-slate-300 font-normal">({primaryContactRelation})</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {primaryContactPhone}
              </p>
            </div>
          </div>

          <button
            onClick={handleQuickDialClick}
            className="px-3.5 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md flex items-center gap-1 active:scale-95 transition-transform shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Quick Dial</span>
          </button>
        </div>
      </div>

      {/* Quick Dial Confirmation & Active Dialing Modal */}
      {showQuickDialModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/40 p-5 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowQuickDialModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2 pt-1">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
                <PhoneCall className="w-8 h-8" />
              </div>

              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30 uppercase tracking-wide">
                Primary ICE Emergency Dial
              </span>

              <h3 className="text-lg font-bold text-white font-heading">
                Calling {primaryContactName}
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                {primaryContactRelation} • <strong className="text-emerald-400 font-mono">{primaryContactPhone}</strong>
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 text-center text-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">Current Device Safety Zone:</span>
              <strong className="text-white font-semibold">{location.city || 'Local Area'} ({location.address || 'GPS Fixed'})</strong>
            </div>

            <div className="space-y-2">
              <a
                href={`tel:${primaryContactPhone.replace(/\s+/g, '')}`}
                onClick={() => {
                  setTimeout(() => setShowQuickDialModal(false), 2000);
                }}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Launch Cellular Dial ({primaryContactPhone})</span>
              </a>

              <a
                href="tel:112"
                className="w-full py-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                <span>Switch to 112 National Police Helpline</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 4. Interactive Live GPS Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-400" /> Live Nearby Safety Radar
          </span>
          <button onClick={() => onNavigate('community')} className="text-rose-400 text-[11px] hover:underline">
            View Heatmap →
          </button>
        </div>

        <LeafletMap center={location} nearbyPlaces={nearbyPlaces} height="220px" />
      </div>

      {/* 5. Nearby Emergency Services Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-400" /> Nearby Helplines & Services
          </span>
          <span className="text-[10px] text-slate-400">24x7 India First</span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {nearbyPlaces.map((place) => (
            <div
              key={place.id}
              className="min-w-[200px] p-3 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 shrink-0 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-white line-clamp-1">{place.name}</span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {place.distanceKm} km
                </span>
              </div>

              <p className="text-[10px] text-slate-400 line-clamp-1">{place.address}</p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-amber-400 font-bold">★ {place.rating}</span>
                <a
                  href={`tel:${place.phone}`}
                  className="px-2.5 py-1 rounded-xl bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-md hover:bg-rose-500"
                >
                  <Phone className="w-3 h-3" /> Call
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Quick Action Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onNavigate('journey')}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-purple-500/40 text-left space-y-2 group transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-purple-400">Journey Protection</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Route deviation & ETA alert</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('fake_call')}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-amber-500/40 text-left space-y-2 group transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-amber-400">Fake Call Trigger</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Escape awkward situations</div>
          </div>
        </button>
      </div>

      {/* 7. Today's Safety Timeline Activity */}
      <div className="glass-panel p-4 rounded-3xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" /> Today's Protection Log
          </span>
          <span className="text-[10px] text-slate-400">Battery: {batteryLevel}%</span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
            <div>
              <span className="font-semibold text-white">Live Geofence Active</span>
              <p className="text-[10px] text-slate-400">High precision GPS tracking active in {location.city}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
            <div>
              <span className="font-semibold text-white">3 Guardians Connected</span>
              <p className="text-[10px] text-slate-400">Venkatesan, Sreejha & Sidhanth monitoring updates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
