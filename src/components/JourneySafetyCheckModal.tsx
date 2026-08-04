import React from 'react';
import { useSafety } from '../contexts/SafetyContext';
import { ShieldCheck, AlertOctagon, BellRing } from 'lucide-react';

export const JourneySafetyCheckModal: React.FC = () => {
  const { isSafetyCheckPending, safetyCheckCountdown, confirmSafetyCheck, triggerSOS } = useSafety();

  if (!isSafetyCheckPending) return null;

  const percentage = Math.max(0, Math.min(100, (safetyCheckCountdown / 30) * 100));

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-sm glass-panel bg-slate-900 border-2 border-purple-500/80 rounded-3xl p-5 text-slate-100 shadow-2xl space-y-4 animate-bounce-short">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/30 rounded-2xl border border-purple-400/40 text-purple-300 animate-pulse">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white font-heading">
              Journey Safety Check-In
            </h3>
            <p className="text-xs text-purple-300 font-medium">
              Scheduled Route Safety Verification
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-white/10 text-center space-y-2">
          <p className="text-xs text-slate-300">
            Please confirm you are safe. If unconfirmed within <strong className="text-amber-400 font-bold">{safetyCheckCountdown}s</strong>, an emergency SOS alert will automatically notify guardians.
          </p>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-1000"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={confirmSafetyCheck}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-200" />
            <span>I AM SAFE — LOG CHECK-IN ({safetyCheckCountdown}s)</span>
          </button>

          <button
            onClick={() => {
              confirmSafetyCheck();
              triggerSOS();
            }}
            className="w-full py-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span>I Need Emergency Help! (Trigger SOS)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
