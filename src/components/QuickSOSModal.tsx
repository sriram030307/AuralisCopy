import React from 'react';
import { useSafety } from '../contexts/SafetyContext';
import { AlertTriangle, ShieldAlert, PhoneCall, Volume2, VolumeX, CheckCircle2, MapPin, Mic, Radio, Download, UploadCloud, Vibrate, MessageSquare, ExternalLink, Megaphone, Zap } from 'lucide-react';

export const QuickSOSModal: React.FC = () => {
  const {
    isSOSActive,
    sosCountdown,
    cancelSOS,
    location,
    isAlarmRinging,
    toggleAlarm,
    isSirenActive,
    toggleSirenMode,
    dispatchSmsFallback,
    smsFallbackMessage,
    isOffline,
    guardians,
    audioRecordingState,
    audioRecordingSecondsLeft,
    latestAudioClipUrl
  } = useSafety();

  if (!isSOSActive && sosCountdown === null) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-3xl flex flex-col justify-between p-5 pt-safe pb-safe text-white overflow-y-auto">
      
      {/* 1. Countdown Mode */}
      {sosCountdown !== null && (
        <div className="flex flex-col items-center justify-center my-auto text-center space-y-6">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-rose-500/30 animate-ping"></div>
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 flex items-center justify-center shadow-2xl shadow-rose-600/70 border-2 border-white/30">
              <span className="text-6xl font-extrabold font-heading text-white">{sosCountdown}</span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold font-heading text-rose-400">Emergency SOS Countdown</h2>
            <p className="text-slate-300 text-xs mt-1 max-w-xs mx-auto">
              Broadcasting your live GPS location, Siren & 30s Audio alert to all {guardians.length} guardians and emergency response...
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Vibrate className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Morse SOS Haptic Pulse Confirmed</span>
          </div>

          <button
            onClick={cancelSOS}
            className="w-full max-w-xs py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-white/20 transition-all active:scale-95 shadow-xl"
          >
            Cancel SOS Alert
          </button>
        </div>
      )}

      {/* 2. Active SOS Dispatch Mode */}
      {isSOSActive && (
        <div className="flex flex-col h-full justify-between space-y-4">
          {/* Header Banner */}
          <div className="glass-panel p-4 rounded-2xl border-2 border-rose-500/50 bg-rose-950/40 text-center space-y-1 shadow-2xl">
            <div className="flex items-center justify-center gap-2 text-rose-400 font-extrabold text-sm uppercase tracking-wider">
              <ShieldAlert className="w-5 h-5 text-rose-500 animate-bounce" />
              <span>EMERGENCY DISPATCH ACTIVE</span>
            </div>
            <p className="text-xs text-slate-200">
              Live GPS location & auto 30s emergency audio recording active.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-mono font-bold text-amber-300">
              <Vibrate className="w-3.5 h-3.5" /> Distinct Haptic Feedback Confirmed
            </div>
          </div>

          {/* Location Card */}
          <div className="glass-panel p-3.5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Current GPS Broadcast</span>
            </div>
            <p className="text-xs font-medium text-slate-200 pl-6">
              {location.address || `${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E (${location.city})`}
            </p>
          </div>

          {/* High-Decibel Siren Threat Deterrent Bar */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${isSirenActive ? 'bg-amber-950/60 border-amber-400 animate-pulse' : 'bg-slate-900 border-white/10'}`}>
            <div className="flex items-center gap-2.5">
              <Megaphone className={`w-5 h-5 ${isSirenActive ? 'text-amber-300 animate-bounce' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs font-bold text-white uppercase">High-Decibel Siren Mode</div>
                <div className="text-[10px] text-slate-300">{isSirenActive ? 'oscillating 850Hz-1600Hz alarm active' : 'Sound siren to deter attackers'}</div>
              </div>
            </div>
            <button
              onClick={toggleSirenMode}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow ${isSirenActive ? 'bg-amber-400 text-slate-950' : 'bg-rose-600 text-white'}`}
            >
              {isSirenActive ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSirenActive ? 'Mute Siren' : 'Play Siren'}</span>
            </button>
          </div>

          {/* 30-Second Automatic Audio Evidence Recording Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border-2 border-rose-500/40 space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Mic className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">30s Auto Emergency Audio Clip</span>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/30">
                {audioRecordingState === 'recording' ? `${audioRecordingSecondsLeft}s remaining` : audioRecordingState === 'uploading' ? 'Uploading...' : 'Secured'}
              </span>
            </div>

            {audioRecordingState === 'recording' && (
              <div className="space-y-1.5">
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-amber-400 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((30 - audioRecordingSecondsLeft) / 30) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><Radio className="w-3 h-3 text-rose-400 animate-spin" /> Recording ambient audio & voice evidence...</span>
                  <span className="font-mono">{30 - audioRecordingSecondsLeft}/30s</span>
                </div>
              </div>
            )}

            {(audioRecordingState === 'completed' || latestAudioClipUrl) && (
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold">
                  <span className="flex items-center gap-1.5"><UploadCloud className="w-3.5 h-3.5 text-emerald-400" /> 30s Audio Incident Evidence Secured</span>
                  <span className="text-[10px] text-slate-400">Encrypted Server Storage</span>
                </div>
                {latestAudioClipUrl && (
                  <div className="flex items-center gap-2 pt-1">
                    <audio controls src={latestAudioClipUrl} className="h-8 w-full rounded-lg bg-slate-950" />
                    <a
                      href={latestAudioClipUrl}
                      download="Auralis_SOS_Emergency_Audio_Clip.webm"
                      className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 shadow"
                      title="Download Recorded Audio Evidence"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Offline SMS Emergency Fallback Dispatcher */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Offline SMS Emergency Backup</span>
              </div>
              <button
                onClick={dispatchSmsFallback}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 shadow"
              >
                <ExternalLink className="w-3 h-3" /> Send SMS Alert
              </button>
            </div>
            <p className="text-[10px] text-slate-300 font-mono line-clamp-2">
              "{smsFallbackMessage}"
            </p>
          </div>

          {/* Quick Dial Emergency Services Grid (India First) */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Direct Emergency Helpline Call</span>
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="tel:112"
                className="p-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs flex items-center justify-between shadow-lg active:scale-95 transition-transform"
              >
                <div>
                  <div className="text-sm">112</div>
                  <div className="text-[10px] text-rose-100 font-normal">National Emergency</div>
                </div>
                <PhoneCall className="w-5 h-5 text-white" />
              </a>

              <a
                href="tel:100"
                className="p-3 rounded-2xl bg-amber-600/90 text-white font-bold text-xs flex items-center justify-between shadow-lg active:scale-95 transition-transform"
              >
                <div>
                  <div className="text-sm">100</div>
                  <div className="text-[10px] text-amber-100 font-normal">Police Control</div>
                </div>
                <PhoneCall className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Alarm Siren Toggle & Safe Action */}
          <div className="space-y-3 pt-2">
            <button
              onClick={cancelSOS}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/40 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>I Am Safe — Resolve Emergency</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

