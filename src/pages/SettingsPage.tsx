import React, { useState } from 'react';
import { useSafety } from '../contexts/SafetyContext';
import { Settings, Smartphone, Shield, Download, Moon, Sun, Check, Copy } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { deviceViewMode, setDeviceViewMode } = useSafety();

  const [darkMode, setDarkMode] = useState(true);
  const [sosCountdownSec, setSosCountdownSec] = useState(3);
  const [copied, setCopied] = useState(false);

  const capacitorCommands = `npm run build
npx cap add android
npx cap copy android
npx cap open android`;

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(capacitorCommands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="p-4 space-y-5 pb-24 text-slate-100 animate-fadeIn">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" /> App Settings & Mobile Build
        </h2>
        <p className="text-xs text-slate-400">
          Preferences, emergency countdowns, and Android APK deployment
        </p>
      </div>

      {/* 1. App Interface Preferences */}
      <div className="glass-panel p-4 rounded-3xl border border-white/10 space-y-3 shadow-xl">
        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
          Appearance & Viewport
        </span>

        <div className="flex items-center justify-between text-xs py-1">
          <div>
            <span className="font-semibold text-white block">Device View Mode</span>
            <span className="text-[10px] text-slate-400">Preview as Phone Mockup or Fullscreen</span>
          </div>
          <button
            onClick={() => setDeviceViewMode(deviceViewMode === 'phone' ? 'fullscreen' : 'phone')}
            className="px-3 py-1.5 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 font-bold text-xs"
          >
            {deviceViewMode === 'phone' ? 'Phone Frame' : 'Full Screen'}
          </button>
        </div>

        <div className="flex items-center justify-between text-xs py-1 border-t border-white/10">
          <div>
            <span className="font-semibold text-white block">Emergency SOS Delay</span>
            <span className="text-[10px] text-slate-400">Seconds before auto-dispatching SOS</span>
          </div>
          <select
            value={sosCountdownSec}
            onChange={(e) => setSosCountdownSec(Number(e.target.value))}
            className="px-2.5 py-1 rounded-xl bg-slate-900 text-white border border-white/10 text-xs font-bold"
          >
            <option value={3}>3 Seconds</option>
            <option value={5}>5 Seconds</option>
            <option value={10}>10 Seconds</option>
          </select>
        </div>
      </div>

      {/* 2. Capacitor Native Android & iOS Export Guide */}
      <div className="glass-panel p-4 rounded-3xl border border-indigo-500/30 bg-indigo-950/20 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span>Capacitor Mobile Deployment (Android APK)</span>
          </div>
          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Native Ready
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          Auralis includes <code className="text-cyan-300 font-mono">capacitor.config.json</code> out of the box. Run these terminal commands to compile into a native Android APK:
        </p>

        <div className="relative bg-slate-950 p-3 rounded-2xl border border-white/10 font-mono text-[11px] text-emerald-400 leading-relaxed">
          <button
            onClick={handleCopyCommands}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <pre>{capacitorCommands}</pre>
        </div>
      </div>
    </div>
  );
};
