import React, { useState } from 'react';
import { useSafety } from '../contexts/SafetyContext';
import { PhoneCall, Clock, User, Phone, Play, ShieldAlert } from 'lucide-react';

export const FakeCallPage: React.FC = () => {
  const { scheduleFakeCall } = useSafety();

  const [callerName, setCallerName] = useState('Venkatesan Ramanujam');
  const [callerNumber, setCallerNumber] = useState('+91 99404 10516');
  const [delay, setDelay] = useState(5); // Default 5 seconds for instant test
  const [scheduled, setScheduled] = useState(false);

  const presets = [
    { name: 'Venkatesan Ramanujam (Primary ICE)', number: '+91 99404 10516' },
    { name: 'Sreejha Venkat (Sister)', number: '+91 99020 42827' },
    { name: 'Sidhanth Sundarrajan (Friend)', number: '+91 63818 45780' },
    { name: 'Police Control Room (112)', number: '112' }
  ];

  const handleTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleFakeCall(callerName, callerNumber, delay);
    setScheduled(true);
    setTimeout(() => setScheduled(false), delay * 1000 + 1000);
  };

  return (
    <div className="p-4 space-y-5 pb-24 text-slate-100 animate-fadeIn">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-amber-400" /> Fake Incoming Call Generator
        </h2>
        <p className="text-xs text-slate-400">
          Simulate a realistic incoming phone call to exit unsafe or uncomfortable situations
        </p>
      </div>

      {scheduled && (
        <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2 animate-pulse">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Fake call scheduled! Screen will ring in {delay} seconds. Put phone in hand.</span>
        </div>
      )}

      {/* Preset Quick Selectors */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-300">Choose Caller Preset:</span>
        <div className="grid grid-cols-2 gap-2">
          {presets.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setCallerName(p.name);
                setCallerNumber(p.number);
              }}
              className={`p-3 rounded-2xl border text-left text-xs transition-all ${callerName === p.name ? 'bg-amber-500/20 border-amber-500 text-white font-bold' : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'}`}
            >
              <div className="font-bold">{p.name}</div>
              <div className="text-[10px] text-slate-400">{p.number}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Call Settings Form */}
      <form onSubmit={handleTrigger} className="glass-panel p-4 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Caller Name</label>
            <input
              type="text"
              value={callerName}
              onChange={(e) => setCallerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Caller Number (+91)</label>
            <input
              type="text"
              value={callerNumber}
              onChange={(e) => setCallerNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1.5 font-semibold">Ring Delay Timer</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { sec: 5, label: '5 Sec' },
                { sec: 15, label: '15 Sec' },
                { sec: 30, label: '30 Sec' },
                { sec: 60, label: '1 Min' }
              ].map(t => (
                <button
                  key={t.sec}
                  type="button"
                  onClick={() => setDelay(t.sec)}
                  className={`py-2 rounded-xl border text-center text-xs font-bold transition-all ${delay === t.sec ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-300 border-white/10'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white font-extrabold text-xs shadow-xl shadow-amber-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-white" /> Schedule Fake Call Now
        </button>
      </form>

      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 space-y-1">
        <span className="font-bold text-amber-400 flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5" /> Simulated Voice Protocol
        </span>
        <p className="text-[11px] text-slate-400">
          When answered, Auralis plays a realistic simulated voice prompt ("I'm waiting outside for you...") so nearby individuals hear a genuine conversation.
        </p>
      </div>
    </div>
  );
};
