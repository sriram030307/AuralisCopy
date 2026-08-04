import React from 'react';
import { PhoneCall, MapPin, BarChart3, Settings, ShieldAlert, X, Smartphone, User, HelpCircle } from 'lucide-react';

interface MoreHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tabId: string) => void;
}

export const MoreHubModal: React.FC<MoreHubModalProps> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'fake_call', title: 'Fake Call Generator', desc: 'Schedule realistic incoming calls to exit uncomfortable situations', icon: PhoneCall, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { id: 'community', title: 'Community Crime Heatmap', desc: 'Verified local incident reports & safe zones in India', icon: MapPin, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { id: 'analytics', title: 'Incident Center & Reports', desc: 'Weekly safety score breakdown & distance analytics', icon: BarChart3, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { id: 'settings', title: 'Settings & Android Build', desc: 'Theme, location frequency, Capacitor mobile app export', icon: Settings, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    { id: 'profile', title: 'Emergency Profile', desc: 'Edit blood group, medical notes & ICE contacts', icon: User, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#090d16] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl text-white space-y-4 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-heading">Auralis Safety Hub</h3>
              <p className="text-[10px] text-slate-400">All Mobile Features & Native Modules</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-800 text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="space-y-2.5">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className="w-full p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 flex items-center gap-3.5 transition-all text-left group active:scale-98"
              >
                <div className={`p-2.5 rounded-xl border ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.desc}</p>
                </div>
                <span className="text-slate-500 text-xs">→</span>
              </button>
            );
          })}
        </div>

        {/* Capacitor Android/iOS Ready Tag */}
        <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Native Capacitor bundle enabled. Ready for Android APK build!</span>
        </div>
      </div>
    </div>
  );
};
