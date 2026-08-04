import React, { useState, useEffect } from 'react';
import { useSafety } from '../contexts/SafetyContext';
import { api } from '../services/api';
import { SafetyIncident } from '../types';
import { MapPin, AlertTriangle, ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const { location } = useSafety();
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('poor_lighting');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<any>('medium');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.getIncidents().then(res => {
      if (res?.incidents) setIncidents(res.incidents);
    });
  }, []);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    await api.reportIncident({
      title,
      category,
      description,
      severity,
      latitude: location.latitude,
      longitude: location.longitude,
      locationName: location.address || `${location.city}`
    });
    const updated = await api.getIncidents();
    if (updated?.incidents) setIncidents(updated.incidents);
    setShowReportModal(false);
    setTitle('');
    setDescription('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="p-4 space-y-5 pb-24 text-slate-100 animate-fadeIn">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" /> Community Safety Heatmap
          </h2>
          <p className="text-xs text-slate-400">
            Crowdsourced verified incident alerts & safe zones in {location.city || 'Local Area'}
          </p>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-lg active:scale-95 transition-transform"
        >
          <Plus className="w-3.5 h-3.5" /> Report Spot
        </button>
      </div>

      {submitted && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Incident report broadcasted to Auralis Community network!</span>
        </div>
      )}

      {/* Incident Cards */}
      <div className="space-y-3">
        <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
          Recent Alerts ({incidents.length})
        </span>

        {incidents.map((inc) => (
          <div
            key={inc.id}
            className="glass-panel p-4 rounded-3xl border border-white/10 space-y-2.5 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl border ${inc.severity === 'high' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : inc.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{inc.title}</h4>
                  <span className="text-[10px] text-slate-400">{inc.locationName} • {inc.timeAgo}</span>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                ✓ {inc.verifiedCount} Verified
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{inc.description}</p>

            <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10 pt-2">
              <span>Reported by {inc.reportedBy}</span>
              <span className="text-emerald-400 font-semibold">Verified Safe Zone Patrol Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Incident Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleReport}
            className="w-full max-w-sm bg-slate-900 border border-white/15 rounded-3xl p-5 space-y-4 shadow-2xl text-white"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-sm font-heading">Report Safety Hazard / Alert</h3>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Incident Title</label>
                <input
                  type="text"
                  placeholder="e.g. Unlit streetlight, Dim walkway"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Hazard Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="poor_lighting">Poor Street Lighting</option>
                  <option value="suspicious_activity">Suspicious Activity</option>
                  <option value="harassment">Harassment Spot</option>
                  <option value="road_accident">Road Blockade / Obstruction</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Description Details</label>
                <textarea
                  rows={3}
                  placeholder="Describe the area condition..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  required
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-transform"
            >
              Broadcast Alert to Community
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
