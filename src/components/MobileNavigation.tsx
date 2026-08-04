import React from 'react';
import { Home, Navigation, AlertTriangle, Users, Bot, MoreHorizontal } from 'lucide-react';
import { useSafety } from '../contexts/SafetyContext';

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMoreMenu: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenMoreMenu
}) => {
  const { triggerSOS, isSOSActive } = useSafety();

  const primaryTabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'journey', label: 'Journey', icon: Navigation },
    { id: 'sos', label: 'SOS', icon: AlertTriangle, isSpecial: true },
    { id: 'guardians', label: 'Guardians', icon: Users },
    { id: 'ai_chat', label: 'Safety AI', icon: Bot },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-2xl border-t border-white/10 px-3 py-2 pb-safe shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-around relative">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isSpecial) {
            return (
              <div key={tab.id} className="relative -top-5 flex flex-col items-center">
                <button
                  onClick={() => {
                    setActiveTab('sos');
                    triggerSOS();
                  }}
                  className={`w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 p-1 shadow-xl shadow-rose-600/50 flex items-center justify-center transition-all transform active:scale-95 ${isSOSActive ? 'animate-bounce ring-4 ring-rose-500/50' : 'hover:scale-105'}`}
                  title="Trigger Emergency SOS"
                >
                  <div className="w-full h-full bg-rose-600 rounded-full flex flex-col items-center justify-center text-white border border-rose-300/40">
                    <AlertTriangle className="w-6 h-6 fill-white text-rose-600" />
                  </div>
                </button>
                <span className="text-[10px] font-extrabold text-rose-400 mt-1 uppercase tracking-wider">
                  SOS
                </span>
              </div>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${isActive ? 'text-rose-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200 font-medium'}`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-rose-500/15 border border-rose-500/30' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* More Menu Trigger */}
        <button
          onClick={onOpenMoreMenu}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
          title="More Hub"
        >
          <div className="p-1.5 rounded-xl bg-slate-800/60 border border-white/5">
            <MoreHorizontal className="w-5 h-5 text-slate-300" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Hub</span>
        </button>
      </div>
    </nav>
  );
};
