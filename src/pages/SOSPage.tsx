import React, { useState } from 'react';
import { useSafety } from '../contexts/SafetyContext';
import { AlertTriangle, ShieldAlert, PhoneCall, Volume2, VolumeX, Radio, Mic, MicOff, Play, Download, FileAudio, CheckCircle2, MessageSquare, WifiOff, Signal, Megaphone, Zap, Vibrate, ExternalLink } from 'lucide-react';

export const SOSPage: React.FC = () => {
  const {
    triggerSOS,
    isSOSActive,
    cancelSOS,
    isAlarmRinging,
    toggleAlarm,
    isSirenActive,
    toggleSirenMode,
    triggerHapticPattern,
    isOffline,
    smsFallbackMessage,
    dispatchSmsFallback,
    lastSmsFallbackTime,
    isWakeWordActive,
    setIsWakeWordActive,
    customWakeWord,
    setCustomWakeWord,
    isVoiceListening,
    lastSpokenTranscript,
    simulateWakeWordTrigger,
    audioRecordingState,
    audioRecordingSecondsLeft,
    audioEvidenceClips,
    latestAudioClipUrl,
    location
  } = useSafety();

  const [silentAlarmMode, setSilentAlarmMode] = useState(false);

  const helplines = [
    { number: '112', title: 'National Emergency', desc: 'All-in-one Police, Fire & Ambulance', color: 'from-rose-600 to-red-600' },
    { number: '100', title: 'Police Control Room', desc: 'State Police Emergency Dispatch', color: 'from-amber-600 to-orange-600' },
    { number: '108', title: 'Medical Ambulance', desc: 'Free Emergency Medical Service', color: 'from-blue-600 to-indigo-600' },
    { number: '1091', title: 'Women Safety Helpline', desc: '24x7 Dedicated Women Assistance', color: 'from-purple-600 to-pink-600' },
    { number: '1090', title: 'Senior Citizen Helpline', desc: 'Specialized Elder Care Emergency', color: 'from-emerald-600 to-teal-600' },
    { number: '181', title: 'Women Distress Center', desc: 'Support & Counselling Service', color: 'from-cyan-600 to-blue-600' }
  ];

  return (
    <div className="p-4 space-y-5 pb-24 text-slate-100 animate-fadeIn">
      
      {/* Title Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold font-heading text-white flex items-center justify-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-500" /> Emergency SOS Center
        </h2>
        <p className="text-xs text-slate-400">
          Instant high-priority dispatch to Auralis Guardians & 112 Command
        </p>
      </div>

      {/* Haptics & Network Protection Status Banner */}
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/90 border border-white/10 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Vibrate className="w-4 h-4 text-amber-400 animate-bounce" />
          <span className="font-semibold text-slate-200">Morse SOS Haptic Pulse</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30">
            Tactile Screenless Feedback
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          {isOffline ? (
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <WifiOff className="w-3.5 h-3.5" /> Offline Mode
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Signal className="w-3.5 h-3.5" /> Cellular Active
            </span>
          )}
        </div>
      </div>

      {/* VOICE WAKE-WORD LISTENER CARD */}
      <div className="glass-panel p-4 rounded-3xl border border-rose-500/30 bg-rose-950/20 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-2xl ${isWakeWordActive ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
              {isWakeWordActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                Voice Wake-Word Listener
              </h4>
              <p className="text-[10px] text-slate-400">
                Trigger silent SOS by speaking your phrase
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWakeWordActive(!isWakeWordActive)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${isWakeWordActive ? 'bg-rose-600' : 'bg-slate-700'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isWakeWordActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>

        {/* Custom Phrase Settings */}
        <div className="space-y-2 pt-1 border-t border-white/10">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-300">Custom SOS Voice Phrase:</span>
            <input
              type="text"
              value={customWakeWord}
              onChange={(e) => setCustomWakeWord(e.target.value)}
              placeholder="e.g. auralis emergency"
              className="px-3 py-1 rounded-xl bg-slate-950 border border-white/10 text-rose-300 font-bold text-xs focus:outline-none focus:border-rose-500 w-44 text-right"
            />
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">
              Mic status: {isVoiceListening ? <strong className="text-emerald-400 font-bold">● Active Listening</strong> : <span className="text-slate-500">Standby</span>}
            </span>
            <button
              onClick={simulateWakeWordTrigger}
              className="px-2.5 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 font-bold flex items-center gap-1 active:scale-95 transition-transform"
            >
              <Play className="w-3 h-3 text-rose-400" /> Test Voice SOS
            </button>
          </div>

          {lastSpokenTranscript && (
            <div className="p-2 rounded-xl bg-slate-950/80 border border-white/10 text-[10px] text-slate-300 truncate">
              🎤 Last heard speech: <span className="text-rose-300 italic">"{lastSpokenTranscript}"</span>
            </div>
          )}
        </div>
      </div>

      {/* Center 3D Pulsing SOS Trigger Button */}
      <div className="flex flex-col items-center justify-center my-6 space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-rose-600/30 animate-sos-pulse"></div>
          
          <button
            onClick={() => {
              triggerHapticPattern('press');
              triggerSOS();
            }}
            className="relative w-44 h-44 rounded-full bg-gradient-to-tr from-rose-700 via-red-600 to-amber-500 p-2 shadow-[0_0_60px_rgba(244,63,94,0.6)] flex flex-col items-center justify-center active:scale-95 transition-transform group cursor-pointer"
          >
            <div className="w-full h-full bg-rose-600 rounded-full flex flex-col items-center justify-center border-2 border-white/40 shadow-inner space-y-1">
              <AlertTriangle className="w-12 h-12 fill-white text-rose-600 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-black font-heading text-white tracking-widest">SOS</span>
              <span className="text-[9px] uppercase font-bold text-rose-100 flex items-center gap-1">
                <Vibrate className="w-3 h-3" /> Haptic Pulse Active
              </span>
            </div>
          </button>
        </div>

        <p className="text-xs text-slate-300 font-medium text-center max-w-xs">
          {isSOSActive ? '🔴 EMERGENCY SOS BROADCAST IS LIVE • 30s AUDIO & SIREN RUNNING' : 'Tap once to trigger 3-second emergency broadcast, haptic pulse & auto 30s audio recording'}
        </p>
      </div>

      {/* HIGH-DECIBEL SIREN DETERRENT MODE PANEL */}
      <div className={`glass-panel p-4 rounded-3xl border transition-all duration-300 ${isSirenActive ? 'border-amber-400/80 bg-amber-950/30 shadow-[0_0_30px_rgba(245,158,11,0.3)]' : 'border-white/10 bg-slate-900/80'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isSirenActive ? 'bg-amber-500 text-slate-950 animate-bounce shadow-lg' : 'bg-slate-800 text-amber-400'}`}>
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                Threat Deterrence High-Decibel Siren
              </h4>
              <p className="text-[10px] text-slate-300">
                Loud oscillating high-frequency acoustic alarm from speaker to deter attackers
              </p>
            </div>
          </div>

          <button
            onClick={toggleSirenMode}
            className={`px-3.5 py-2 rounded-2xl font-extrabold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all ${isSirenActive ? 'bg-amber-400 text-slate-950 border border-amber-300 animate-pulse' : 'bg-rose-600 hover:bg-rose-500 text-white'}`}
          >
            {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSirenActive ? 'Mute Siren' : 'Activate Siren'}</span>
          </button>
        </div>

        {isSirenActive && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-950/60 border border-amber-500/40 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400 animate-spin" /> High-Decibel Dual-Tone Siren Sound Playing...</span>
              <span className="text-[10px] font-mono uppercase bg-amber-900 px-2 py-0.5 rounded text-amber-200">850Hz - 1600Hz Sweep</span>
            </div>
            <div className="flex justify-center items-center gap-1.5 py-1">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-amber-400 rounded-full animate-pulse"
                  style={{
                    height: `${12 + (i % 4) * 8}px`,
                    animationDuration: `${0.2 + (i % 3) * 0.15}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* OFFLINE SMS EMERGENCY FALLBACK BACKUP CARD */}
      <div className="glass-panel p-4 rounded-3xl border border-indigo-500/30 bg-indigo-950/20 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
                Offline SMS Emergency Backup
              </h4>
              <p className="text-[10px] text-slate-400">
                Dispatches cellular SMS with GPS pin if internet data drops
              </p>
            </div>
          </div>

          <button
            onClick={dispatchSmsFallback}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow active:scale-95 transition-transform shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Send SMS Alert
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300">
            <span>Pre-formatted Cellular SMS Payload:</span>
            {lastSmsFallbackTime && (
              <span className="text-[10px] text-emerald-400 font-mono">Dispatched at {lastSmsFallbackTime}</span>
            )}
          </div>
          <p className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-white/5 break-words">
            "{smsFallbackMessage}"
          </p>
        </div>
      </div>

      {/* 30-SECOND EMERGENCY AUDIO INCIDENT RECORDING PANEL */}
      <div className="glass-panel p-4 rounded-3xl border border-rose-500/30 bg-rose-950/20 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-600/30 text-rose-300 border border-rose-500/30">
              <Mic className="w-5 h-5 animate-pulse text-rose-400" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
                30s Auto Audio Documentation
              </h4>
              <p className="text-[10px] text-slate-400">
                Captures 30 seconds of ambient voice & noise evidence on SOS trigger
              </p>
            </div>
          </div>

          <span className="text-[10px] px-2 py-1 rounded-full bg-rose-900/60 text-rose-200 font-mono font-bold border border-rose-500/30">
            {isSOSActive ? `${audioRecordingSecondsLeft}s Recording` : 'Auto-Trigger Ready'}
          </span>
        </div>

        {isSOSActive && audioRecordingState === 'recording' && (
          <div className="p-3 rounded-2xl bg-slate-950/90 border border-rose-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-rose-300">
              <span className="flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-rose-400 animate-spin" /> Live 30s Emergency Audio Recording Active...</span>
              <span className="font-mono text-rose-200">{30 - audioRecordingSecondsLeft}/30s</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-500 to-amber-400 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${((30 - audioRecordingSecondsLeft) / 30) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Audio Evidence List */}
        <div className="space-y-2 pt-1 border-t border-white/10">
          <span className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1"><FileAudio className="w-3.5 h-3.5 text-emerald-400" /> Recorded Audio Evidence Logs ({audioEvidenceClips.length})</span>
            <span className="text-[10px] text-slate-400 font-normal">Secured Server Storage</span>
          </span>

          {audioEvidenceClips.length === 0 ? (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-[11px] text-slate-400 text-center italic">
              No emergency audio clips recorded yet. Pressing SOS automatically records and uploads 30s audio.
            </div>
          ) : (
            <div className="space-y-2">
              {audioEvidenceClips.map((clip) => (
                <div key={clip.id} className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 30s Emergency Clip ({clip.timestamp})
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      Secured on Server
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    📍 {clip.locationAddress}
                  </p>

                  {clip.audioUrl && (
                    <div className="flex items-center gap-2 pt-1">
                      <audio controls src={clip.audioUrl} className="h-8 w-full rounded-lg bg-slate-900" />
                      <a
                        href={clip.audioUrl}
                        download={`Auralis_SOS_Audio_Incident_${clip.id}.webm`}
                        className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
                        title="Download Audio File"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Silent Alarm Mode Toggle */}
      <div className="glass-panel p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Silent Alarm Mode</h4>
            <p className="text-[10px] text-slate-400">Send SOS without ringing audio alarm</p>
          </div>
        </div>

        <button
          onClick={() => setSilentAlarmMode(!silentAlarmMode)}
          className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${silentAlarmMode ? 'bg-purple-600' : 'bg-slate-700'}`}
        >
          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${silentAlarmMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </button>
      </div>

      {/* Official India Helplines Grid */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
          Official Emergency Services (India)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {helplines.map((h) => (
            <a
              key={h.number}
              href={`tel:${h.number}`}
              className={`p-3.5 rounded-2xl bg-gradient-to-r ${h.color} text-white flex items-center justify-between shadow-xl active:scale-98 transition-transform`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black font-heading">{h.number}</span>
                  <span className="text-xs font-bold">{h.title}</span>
                </div>
                <p className="text-[10px] text-white/80 mt-0.5">{h.desc}</p>
              </div>
              <PhoneCall className="w-5 h-5 text-white/90" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

