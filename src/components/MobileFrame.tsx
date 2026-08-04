import React from 'react';
import { useSafety } from '../contexts/SafetyContext';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const { deviceViewMode } = useSafety();

  if (deviceViewMode === 'phone') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-2 sm:p-6 select-none">
        {/* iPhone / Android Native Outer Frame */}
        <div className="relative w-full max-w-[420px] h-[860px] max-h-[92vh] bg-[#000000] rounded-[48px] border-[10px] border-slate-800 shadow-[0_0_80px_rgba(244,63,94,0.15)] flex flex-col overflow-hidden ring-1 ring-white/20">
          
          {/* Dynamic Island / Camera Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-end px-2 border border-slate-800/80">
            <div className="w-2.5 h-2.5 rounded-full bg-[#111] ring-1 ring-slate-800"></div>
          </div>

          {/* Screen Content Wrapper */}
          <div className="w-full h-full bg-[#090d16] flex flex-col overflow-y-auto overscroll-none text-slate-100 font-sans relative pt-2">
            {children}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full z-50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex flex-col w-full max-w-7xl mx-auto relative shadow-2xl border-x border-white/5">
      {children}
    </div>
  );
};
