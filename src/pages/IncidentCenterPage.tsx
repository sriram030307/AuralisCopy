import React from 'react';
import { useSafety } from '../contexts/SafetyContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { BarChart3, ShieldCheck, MapPin, Activity, Award, Download } from 'lucide-react';

export const IncidentCenterPage: React.FC = () => {
  const { location } = useSafety();

  const weeklyData = [
    { day: 'Mon', score: 90, km: 6.2 },
    { day: 'Tue', score: 92, km: 8.4 },
    { day: 'Wed', score: 95, km: 5.1 },
    { day: 'Thu', score: 91, km: 7.8 },
    { day: 'Fri', score: 94, km: 11.2 },
    { day: 'Sat', score: 96, km: 4.5 },
    { day: 'Sun', score: 94, km: 5.3 }
  ];

  return (
    <div className="p-4 space-y-5 pb-24 text-slate-100 animate-fadeIn">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" /> Incident Center & Analytics
          </h2>
          <p className="text-xs text-slate-400">
            Weekly personal protection metrics & safe travel breakdown
          </p>
        </div>

        <button
          onClick={() => alert('Auralis Weekly Safety Report exported to PDF/JSON!')}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-400 border border-white/10"
          title="Export PDF Report"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 space-y-0.5">
          <span className="text-[10px] text-slate-400 block">Safety Score</span>
          <span className="text-lg font-black text-rose-400 font-heading">94/100</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 space-y-0.5">
          <span className="text-[10px] text-slate-400 block">Km Protected</span>
          <span className="text-lg font-black text-indigo-400 font-heading">48.5 km</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 space-y-0.5">
          <span className="text-[10px] text-slate-400 block">Safe Journeys</span>
          <span className="text-lg font-black text-emerald-400 font-heading">14</span>
        </div>
      </div>

      {/* Recharts Safety Score Trend Chart */}
      <div className="glass-panel p-4 rounded-3xl border border-white/10 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-purple-400" /> 7-Day Safety Score Trend
          </span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            +4.2% Safe
          </span>
        </div>

        <div className="h-44 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis domain={[80, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#scoreGlow)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Visited Safe Zones */}
      <div className="glass-panel p-4 rounded-3xl border border-white/10 space-y-3">
        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" /> Top Safe Zones Visited (India)
        </span>

        <div className="space-y-2 text-xs">
          {[
            { zone: 'Indiranagar Metro Station Security Zone', count: '6 Visits', status: 'High Safety Rating (4.9)' },
            { zone: 'Koramangala 5th Block Pink Police Hub', count: '4 Visits', status: 'CCTV Monitored' },
            { zone: 'MG Road Central Mall Patrol', count: '3 Visits', status: '24x7 Security' }
          ].map(z => (
            <div key={z.zone} className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">{z.zone}</div>
                <div className="text-[10px] text-slate-400">{z.status}</div>
              </div>
              <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                {z.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
