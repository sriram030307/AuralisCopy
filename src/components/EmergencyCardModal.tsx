import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Heart, User, Phone, X, Award } from 'lucide-react';

interface EmergencyCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyCardModal: React.FC<EmergencyCardModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  const qrData = JSON.stringify({
    auralisId: user?.id || 'user_91001',
    name: user?.name || 'Auralis User',
    phone: user?.phone || '+91 98765 43210',
    bloodGroup: user?.bloodGroup || 'O+',
    medicalNotes: user?.medicalNotes || 'Keep emergency notes handy',
    iceContacts: ['+91 99404 10516 (Venkatesan Ramanujam - Primary)', '+91 99020 42827 (Sreejha Venkat - Sister)', '+91 63818 45780 (Sidhanth Sundarrajan - Friend)']
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-950 to-[#090d16] border border-white/15 rounded-3xl p-5 shadow-2xl relative text-white space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Card Header */}
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
          <div className="p-2 rounded-xl bg-rose-600/20 text-rose-500 border border-rose-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base font-heading">Emergency Medical ID</h3>
            <p className="text-[10px] text-slate-400">Lockscreen QR Scan • Official India Safety Card</p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-inner">
          <QRCodeSVG value={qrData} size={150} level="H" />
          <span className="text-[10px] text-slate-700 font-bold mt-2 uppercase tracking-wider">
            Scan to view ICE Contacts & Medical Notes
          </span>
        </div>

        {/* Vital Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-white/5 space-y-0.5">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <User className="w-3 h-3 text-rose-400" /> Full Name
            </span>
            <span className="font-bold text-slate-100 block">{user?.name || 'Auralis User'}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-white/5 space-y-0.5">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-500" /> Blood Group
            </span>
            <span className="font-extrabold text-rose-400 block text-sm">{user?.bloodGroup || 'O+'}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-white/5 space-y-1 text-xs">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Phone className="w-3 h-3 text-emerald-400" /> Primary ICE Phone
          </span>
          <span className="font-semibold text-slate-200 block">{user?.primaryContactPhone || '+91 99404 10516'} ({user?.primaryContactName || 'Venkatesan Ramanujam'})</span>
        </div>

        <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1 text-xs">
          <span className="text-[10px] text-rose-300 font-bold uppercase flex items-center gap-1">
            <Award className="w-3 h-3 text-rose-400" /> Medical & Allergy Notes
          </span>
          <p className="text-[11px] text-slate-200">{user?.medicalNotes || 'No known drug allergies. Keeps inhaler in handbag.'}</p>
        </div>
      </div>
    </div>
  );
};
