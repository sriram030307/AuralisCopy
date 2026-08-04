import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Phone, Mail, Shield, CheckCircle2, Lock, Fingerprint, Chrome, Smartphone, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, updateUser, user } = useAuth();

  const [authMethod, setAuthMethod] = useState<'phone' | 'email' | 'google' | 'biometric'>('phone');
  const [customName, setCustomName] = useState(user?.name || '');
  const [phone, setPhone] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['5', '2', '8', '1']);
  const [email, setEmail] = useState('user@auralis.in');
  const [password, setPassword] = useState('••••••••');
  const [authenticating, setAuthenticating] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpSent(true);
  };

  const handleVerifyLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthenticating(true);
    await new Promise(r => setTimeout(r, 600));
    await login(email);
    if (customName.trim()) {
      await updateUser({ name: customName.trim(), phone: `+91 ${phone}` });
    }
    setAuthenticating(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-sm glass-panel p-5 rounded-3xl border border-white/20 space-y-4 text-white shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-heading text-white">Security Authentication</h3>
              <p className="text-[10px] text-slate-400">Auralis Encrypted India Safety Vault</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Identity verified! Welcome {user?.name || customName || 'User'}.</span>
          </div>
        )}

        {/* Auth Method Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-white/10 text-xs font-bold">
          <button
            onClick={() => setAuthMethod('phone')}
            className={`py-2 rounded-xl transition-all ${authMethod === 'phone' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            +91 Mobile
          </button>
          <button
            onClick={() => setAuthMethod('email')}
            className={`py-2 rounded-xl transition-all ${authMethod === 'email' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Email
          </button>
          <button
            onClick={() => setAuthMethod('biometric')}
            className={`py-2 rounded-xl transition-all ${authMethod === 'biometric' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Biometric
          </button>
        </div>

        {/* Name Input */}
        <div className="text-xs">
          <label className="text-slate-300 block mb-1 font-semibold">Your Full Name</label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="e.g. Rahul Verma or Ananya"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* 1. Mobile Phone + OTP */}
        {authMethod === 'phone' && (
          <div className="space-y-3">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Indian Mobile Number (+91)</label>
                  <div className="flex gap-2">
                    <span className="px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-300 font-bold flex items-center">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-rose-500 font-mono tracking-wider"
                      placeholder="9876543210"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <span>Request OTP SMS</span> <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyLogin} className="space-y-3 text-xs animate-fadeIn">
                <div className="text-center space-y-1">
                  <span className="text-slate-300 font-medium">Enter 4-digit code sent to +91 {phone}</span>
                  <p className="text-[10px] text-emerald-400 font-mono">Demo OTP: 5281</p>
                </div>

                <div className="flex justify-center gap-2 py-1">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const newArr = [...otpCode];
                        newArr[idx] = e.target.value;
                        setOtpCode(newArr);
                      }}
                      className="w-12 h-12 rounded-2xl bg-slate-950 border border-rose-500/50 text-center text-lg font-bold text-white focus:outline-none focus:border-rose-400 shadow-inner"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={authenticating}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg active:scale-95 transition-transform"
                >
                  {authenticating ? 'Verifying Phone Hash...' : 'Verify & Access Auralis'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 2. Email + Password */}
        {authMethod === 'email' && (
          <form onSubmit={handleVerifyLogin} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authenticating}
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg active:scale-95 transition-transform"
            >
              {authenticating ? 'Authenticating...' : 'Sign In with Email'}
            </button>
          </form>
        )}

        {/* 3. Biometric Passkey */}
        {authMethod === 'biometric' && (
          <div className="py-4 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-950 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse shadow-xl">
              <Fingerprint className="w-10 h-10" />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              Touch fingerprint sensor or scan Face Unlock to log in instantaneously without typing passwords.
            </p>

            <button
              onClick={() => handleVerifyLogin()}
              disabled={authenticating}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Fingerprint className="w-4 h-4" /> Simulate Biometric Auth
            </button>
          </div>
        )}

        {/* 4. Google One-Tap Sign In */}
        <div className="border-t border-white/10 pt-3">
          <button
            onClick={() => handleVerifyLogin()}
            className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <Chrome className="w-4 h-4 text-rose-400" /> Sign In with Google
          </button>
        </div>
      </div>
    </div>
  );
};
