import React, { useState } from 'react';
import { ShieldCheck, Navigation, Bot, PhoneCall, Users, BarChart3, ChevronRight, Check } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      icon: <Navigation className="w-12 h-12 text-indigo-400" />,
      title: 'Journey Protection',
      subtitle: 'Smart Live Route Monitoring',
      description: 'Select your destination anywhere in India. Auralis monitors your ETA, detects route deviations, and automatically pings guardians if unannounced stops occur.',
      gradient: 'from-indigo-600/30 to-purple-600/30',
      badge: 'Live GPS Tracking'
    },
    {
      icon: <Bot className="w-12 h-12 text-rose-400" />,
      title: 'AI Guardian Companion',
      subtitle: 'Contextual Safety Guidance',
      description: 'Powered by Gemini AI with voice support. Get instant advice for night travel, cab safety rules, first aid instructions, and real-time de-escalation tips.',
      gradient: 'from-rose-600/30 to-pink-600/30',
      badge: 'Gemini 2.5 Inside'
    },
    {
      icon: <PhoneCall className="w-12 h-12 text-amber-400" />,
      title: 'Emergency SOS & Siren',
      subtitle: '3-Second Instant Rescue Dispatch',
      description: 'Long press to dispatch GPS coordinates to Police (100/112), Women Helpline (1091), and family contacts with a high-decibel audible alarm.',
      gradient: 'from-amber-600/30 to-orange-600/30',
      badge: 'High-Decibel Siren'
    },
    {
      icon: <Users className="w-12 h-12 text-emerald-400" />,
      title: 'Guardian Network & Heatmap',
      subtitle: 'Stay Connected with Loved Ones',
      description: 'Invite family & close friends as guardians. View community-reported safety hazards, unlit streetlights, and verified safe zones in your city.',
      gradient: 'from-emerald-600/30 to-teal-600/30',
      badge: 'India Safety Network'
    }
  ];

  const slide = slides[currentStep];

  const handleNext = () => {
    if (currentStep < slides.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/20 space-y-6 text-center text-white shadow-2xl relative overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className={`absolute -top-24 -left-24 w-64 h-64 bg-gradient-to-br ${slide.gradient} rounded-full blur-3xl pointer-events-none transition-all duration-700`} />

        {/* Top Header & Skip */}
        <div className="flex items-center justify-between relative z-10 text-xs text-slate-400">
          <span className="font-mono font-bold text-rose-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> AURALIS
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-semibold transition-colors"
          >
            Skip Intro
          </button>
        </div>

        {/* Slide Visual Card */}
        <div className="py-6 flex flex-col items-center justify-center space-y-4 relative z-10">
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/15 shadow-2xl animate-pulse">
            {slide.icon}
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/10 text-rose-300 border border-white/10">
            {slide.badge}
          </span>
        </div>

        {/* Text Content */}
        <div className="space-y-2 relative z-10">
          <h3 className="text-xl font-bold font-heading text-white">{slide.title}</h3>
          <p className="text-xs font-semibold text-rose-400">{slide.subtitle}</p>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
            {slide.description}
          </p>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-1.5 relative z-10 pt-2">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-rose-500' : 'w-1.5 bg-slate-700'}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="pt-2 relative z-10">
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-xl shadow-rose-600/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            {currentStep === slides.length - 1 ? (
              <>
                <Check className="w-4 h-4" /> Get Started with Auralis
              </>
            ) : (
              <>
                Next Feature <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
