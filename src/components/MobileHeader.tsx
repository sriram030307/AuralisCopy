import React, { useState } from 'react';
import { useSafety } from '../contexts/SafetyContext';
import { useAuth } from '../contexts/AuthContext';
import { Shield, MapPin, Battery, Wifi, Bell, Smartphone, Monitor } from 'lucide-react';

interface MobileHeaderProps {
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenEmergencyCard?: () => void;
  onOpenOnboarding?: () => void;
  onOpenLogin?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onOpenNotifications,
  onOpenProfile,
  onOpenEmergencyCard,
  onOpenOnboarding,
  onOpenLogin
}) => {
  const { location, batteryLevel, isOnline, selectedCity, setSelectedCity, deviceViewMode, setDeviceViewMode } = useSafety();
  const { user } = useAuth();
  const [showCityPicker, setShowCityPicker] = useState(false);

  const cities = ['Bengaluru', 'Delhi NCR', 'Mumbai', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'];

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-xl border-b border-white/10 px-4 py-2.5 pt-safe">
      {/* Top Mobile Status Line */}
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5 px-0.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wide text-slate-200">AURALIS OS</span>
          <span className="inline-block w-1 h-1 rounded-full bg-slate-600"></span>
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <Wifi className="w-3 h-3" />
            <span>{isOnline ? '5G Protected' : 'Offline Mode'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Device View Mode Toggle */}
          <button
            onClick={() => setDeviceViewMode(deviceViewMode === 'fullscreen' ? 'phone' : 'fullscreen')}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors flex items-center gap-1 text-[10px]"
            title="Toggle Phone Frame View"
          >
            {deviceViewMode === 'fullscreen' ? <Smartphone className="w-3 h-3 text-rose-400" /> : <Monitor className="w-3 h-3 text-cyan-400" />}
            <span className="hidden sm:inline">{deviceViewMode === 'fullscreen' ? 'Phone Frame' : 'Full Screen'}</span>
          </button>

          {/* Battery Indicator */}
          <div className="flex items-center gap-1 text-slate-300">
            <span>{batteryLevel}%</span>
            <Battery className={`w-3.5 h-3.5 ${batteryLevel < 20 ? 'text-rose-500 fill-rose-500' : 'text-emerald-400'}`} />
          </div>
        </div>
      </div>

      {/* Primary Mobile App Bar */}
      <div className="flex items-center justify-between gap-3">
        {/* Brand & City Selector */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-rose-500/20">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-rose-500 fill-rose-500/20" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold font-heading text-white tracking-tight leading-none">Auralis</h1>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                India 🛡️
              </span>
            </div>

            {/* City Switcher Trigger */}
            <div className="relative mt-0.5">
              <button
                onClick={() => setShowCityPicker(!showCityPicker)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                <MapPin className="w-3 h-3 text-rose-400 animate-pulse" />
                <span className="font-semibold text-slate-200">{selectedCity}</span>
                <span className="text-[9px] text-slate-500">▼</span>
              </button>

              {showCityPicker && (
                <div className="absolute left-0 mt-2 w-44 bg-slate-900 border border-white/15 rounded-xl shadow-2xl p-1 z-50">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400 border-b border-white/10">
                    Select Region (India)
                  </div>
                  {cities.map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        setSelectedCity(c);
                        setShowCityPicker(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors ${selectedCity === c ? 'bg-rose-600 text-white font-bold' : 'text-slate-300 hover:bg-white/10'}`}
                    >
                      <span>{c}</span>
                      {selectedCity === c && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Icons */}
        <div className="flex items-center gap-1.5">
          {/* Onboarding Tour */}
          <button
            onClick={onOpenOnboarding}
            className="px-2 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-rose-300 text-[11px] font-bold flex items-center gap-1 transition-all"
            title="App Onboarding Tour"
          >
            <span>✨</span>
            <span className="hidden sm:inline">Intro</span>
          </button>

          {/* QR Emergency Medical ID Card */}
          <button
            onClick={onOpenEmergencyCard}
            className="px-2 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-semibold flex items-center gap-1 transition-all"
            title="QR Medical Card"
          >
            <span>💳</span>
            <span className="hidden xs:inline">QR</span>
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-300 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          </button>

          {/* User Profile Avatar / Login */}
          <button
            onClick={onOpenLogin || onOpenProfile}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-500 p-0.5 text-xs font-bold text-white flex items-center justify-center shadow-md overflow-hidden"
            title="Login / Profile"
          >
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-rose-400 font-extrabold">
              {user?.name ? user.name.charAt(0) : 'S'}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
