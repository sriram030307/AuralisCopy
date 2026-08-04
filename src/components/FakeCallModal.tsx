import React, { useState, useEffect } from 'react';
import { useSafety } from '../contexts/SafetyContext';
import { useAuth } from '../contexts/AuthContext';
import { PhoneCall, PhoneOff, Mic, Volume2, UserCheck } from 'lucide-react';

export const FakeCallModal: React.FC = () => {
  const { isFakeCallActive, fakeCallData, acceptFakeCall, declineFakeCall } = useSafety();
  const { user } = useAuth();
  const [callState, setCallState] = useState<'ringing' | 'connected'>('ringing');
  const [callDuration, setCallDuration] = useState(0);

  const userName = user?.name ? user.name.split(' ')[0] : 'there';

  useEffect(() => {
    let timer: any;
    if (callState === 'connected') {
      timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  if (!isFakeCallActive) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col justify-between p-6 pt-safe pb-safe text-white">
      {/* Caller Header Info */}
      <div className="flex flex-col items-center mt-12 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 via-indigo-500 to-purple-600 p-1 shadow-2xl animate-pulse mb-4">
          <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-3xl font-bold text-white">
            {fakeCallData.callerName.charAt(0)}
          </div>
        </div>

        <h2 className="text-2xl font-bold font-heading">{fakeCallData.callerName}</h2>
        <p className="text-slate-400 text-sm mt-0.5">{fakeCallData.callerNumber}</p>

        <div className="mt-3 inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
          {callState === 'ringing' ? 'Incoming Auralis SafeCall...' : `Call Connected • ${formatTime(callDuration)}`}
        </div>
      </div>

      {/* Simulated AI Voice Line Prompt */}
      {callState === 'connected' && (
        <div className="glass-panel p-4 rounded-2xl text-center my-6 border border-white/10">
          <p className="text-xs text-rose-300 font-semibold mb-1"> Simulated Guardian Voice Line:</p>
          <p className="text-sm font-medium italic text-slate-200">
            "Hey {userName}, I'm waiting outside in my car right now. Are you coming down or should I walk inside?"
          </p>
        </div>
      )}

      {/* Action Controls */}
      <div className="mb-12">
        {callState === 'ringing' ? (
          <div className="flex items-center justify-around">
            {/* Decline */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={declineFakeCall}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center text-white shadow-xl shadow-rose-600/50 active:scale-95 transition-all"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <span className="text-xs text-slate-400">Decline</span>
            </div>

            {/* Answer */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setCallState('connected')}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/50 active:scale-95 transition-all animate-bounce"
              >
                <PhoneCall className="w-7 h-7" />
              </button>
              <span className="text-xs text-slate-400">Answer</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
              <button className="p-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </button>
              <button className="p-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </button>
              <button className="p-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => {
                setCallState('ringing');
                acceptFakeCall();
              }}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center text-white shadow-xl shadow-rose-600/50 active:scale-95 transition-all mt-4"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
