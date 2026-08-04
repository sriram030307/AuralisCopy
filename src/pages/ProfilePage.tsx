import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Phone, Heart, FileText, MapPin, Save, ShieldCheck, CheckCircle2, LogOut } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [primaryContactName, setPrimaryContactName] = useState(user?.primaryContactName || 'Venkatesan Ramanujam');
  const [primaryContactPhone, setPrimaryContactPhone] = useState(user?.primaryContactPhone || '+91 99404 10516');
  const [primaryContactRelation, setPrimaryContactRelation] = useState(user?.primaryContactRelation || 'Primary Contact (ICE)');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O+');
  const [medicalNotes, setMedicalNotes] = useState(user?.medicalNotes || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setPrimaryContactName(user.primaryContactName || 'Venkatesan Ramanujam');
      setPrimaryContactPhone(user.primaryContactPhone || '+91 99404 10516');
      setPrimaryContactRelation(user.primaryContactRelation || 'Primary Contact (ICE)');
      setBloodGroup(user.bloodGroup || 'O+');
      setMedicalNotes(user.medicalNotes || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setPincode(user.pincode || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser({
      name,
      phone,
      primaryContactName,
      primaryContactPhone,
      primaryContactRelation,
      bloodGroup,
      medicalNotes,
      address,
      city,
      pincode
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-4 space-y-5 pb-24 text-slate-100 animate-fadeIn">
      
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 p-0.5 shadow-xl">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-extrabold text-xl text-rose-400">
            {name.charAt(0)}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold font-heading text-white">{name}</h2>
          <p className="text-xs text-slate-400">{phone} • {city}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
            ✓ Verified Auralis Safety ID
          </span>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Emergency medical profile updated! Synced to lockscreen QR card.</span>
        </div>
      )}

      {/* Editable Form */}
      <form onSubmit={handleSave} className="glass-panel p-4 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
          Personal & Medical Information
        </span>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Phone (+91 India)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          {/* Primary Emergency Quick Dial Contact */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2.5">
            <span className="text-[11px] font-extrabold uppercase text-emerald-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Primary Quick Dial Emergency Contact (ICE)
            </span>

            <div className="space-y-2">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Contact Name</label>
                <input
                  type="text"
                  value={primaryContactName}
                  onChange={(e) => setPrimaryContactName(e.target.value)}
                  placeholder="e.g. Venkatesan Ramanujam"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-emerald-200 focus:outline-none focus:border-emerald-500 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={primaryContactPhone}
                    onChange={(e) => setPrimaryContactPhone(e.target.value)}
                    placeholder="+91 99404 10516"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-emerald-200 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Relationship</label>
                  <input
                    type="text"
                    value={primaryContactRelation}
                    onChange={(e) => setPrimaryContactRelation(e.target.value)}
                    placeholder="e.g. Brother / Parent"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-rose-500 font-bold"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">PIN Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Medical & Allergy Notes for Emergency First Responders</label>
            <textarea
              rows={3}
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-rose-500"
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-xl shadow-rose-600/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Emergency Medical Profile
        </button>
      </form>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="w-full py-3 rounded-2xl bg-slate-900 border border-white/10 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 font-bold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Log Out of Auralis Session</span>
        </button>
      </div>
    </div>
  );
};
