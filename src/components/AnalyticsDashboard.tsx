import React from 'react';
import { Defect } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Layers, 
  Flame, 
  Gauge
} from 'lucide-react';

interface AnalyticsDashboardProps {
  defects: Defect[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ defects }) => {
  const total = defects.length;
  const critical = defects.filter((d) => d.severity === 'critical').length;
  const major = defects.filter((d) => d.severity === 'major').length;
  const minor = defects.filter((d) => d.severity === 'minor').length;
  const closed = defects.filter((d) => d.status === 'closed').length;
  const verified = defects.filter((d) => d.status === 'verified').length;

  // FTQ calculation simulation: 100 - (active defects * 0.45)
  const ftqPercent = Math.max(88, Math.min(99.4, 100 - total * 0.4)).toFixed(1);

  // Pareto Categories tally
  const categoryCounts: Record<string, number> = {};
  defects.forEach((d) => {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const maxCategoryCount = Math.max(...sortedCategories.map((c) => c[1]), 1);

  // Station counts
  const stationCounts: Record<string, number> = {};
  defects.forEach((d) => {
    stationCounts[d.station] = (stationCounts[d.station] || 0) + 1;
  });
  const sortedStations = Object.entries(stationCounts).sort((a, b) => b[1] - a[1]);
  const maxStationCount = Math.max(...sortedStations.map((s) => s[1]), 1);

  return (
    <div className="space-y-6">
      {/* KPI Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: First Time Quality */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>First Time Quality (FTQ)</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {ftqPercent}%
            </span>
            <span className="text-xs text-emerald-400 font-medium">+0.8% vs last shift</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${ftqPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">IATF 16949 Target: &ge; 98.0%</p>
        </div>

        {/* KPI 2: Active Defects */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Quality Incidents</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {total - closed}
            </span>
            <span className="text-xs text-slate-400 font-medium">of {total} total logged</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
            <span className="text-red-400 font-mono font-semibold">{critical} Critical</span>
            <span>·</span>
            <span className="text-amber-400 font-mono font-semibold">{major} Major</span>
            <span>·</span>
            <span className="text-cyan-400 font-mono font-semibold">{minor} Minor</span>
          </div>
        </div>

        {/* KPI 3: MTTR */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Mean Time to Resolve (MTTR)</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              2.4h
            </span>
            <span className="text-xs text-cyan-400 font-medium">-25 min vs target</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            Average time from Andon pull to verified countermeasure
          </p>
        </div>

        {/* KPI 4: Countermeasure Implementation */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Kaizen Resolution Rate</span>
            <CheckCircle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {total > 0 ? Math.round(((closed + verified) / total) * 100) : 0}%
            </span>
            <span className="text-xs text-purple-400 font-medium">
              {closed + verified} closed / verified
            </span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            Actions verified by Quality Assurance
          </p>
        </div>
      </div>

      {/* Main Charts: Pareto 80/20 & Station Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pareto Defect Breakdown */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Defect Pareto 80/20 Distribution</span>
              </h3>
              <p className="text-xs text-slate-400">
                Frequency by defect category to prioritize Lean Kaizen containment
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">IATF 16949 AUDIT</span>
          </div>

          <div className="space-y-3 pt-2">
            {sortedCategories.map(([category, count], idx) => {
              const pct = Math.round((count / maxCategoryCount) * 100);
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{category}</span>
                    <span className="font-mono text-amber-400 tabular-nums">
                      {count} defects ({Math.round((count / total) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Station Frequency Heatmap */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Assembly Station Frequency</span>
            </h3>
            <p className="text-xs text-slate-400">
              Stations requiring inspection focus or tooling recalibration
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {sortedStations.slice(0, 5).map(([stn, count]) => {
              const widthPct = Math.round((count / maxStationCount) * 100);
              return (
                <div key={stn} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-medium truncate max-w-[200px]">{stn}</span>
                    <span className="font-mono text-cyan-400 tabular-nums">{count} incidents</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full transition-all"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Shift Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">Shift Quality Performance Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Production Shift</th>
                <th className="py-2.5 px-3">Units Inspected</th>
                <th className="py-2.5 px-3">Defects Logged</th>
                <th className="py-2.5 px-3">First Time Quality</th>
                <th className="py-2.5 px-3">Andon Pulls</th>
                <th className="py-2.5 px-3">Avg Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              <tr className="hover:bg-slate-850/50">
                <td className="py-2.5 px-3 text-white font-sans font-medium">Shift A (06:00 - 14:00)</td>
                <td className="py-2.5 px-3 tabular-nums">248 Units</td>
                <td className="py-2.5 px-3 text-amber-400 tabular-nums">4 Defects</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold tabular-nums">98.4%</td>
                <td className="py-2.5 px-3 text-red-400 tabular-nums">1 Line Pause</td>
                <td className="py-2.5 px-3 text-slate-400">1.8 Hours</td>
              </tr>
              <tr className="hover:bg-slate-850/50">
                <td className="py-2.5 px-3 text-white font-sans font-medium">Shift B (14:00 - 22:00)</td>
                <td className="py-2.5 px-3 tabular-nums">232 Units</td>
                <td className="py-2.5 px-3 text-amber-400 tabular-nums">6 Defects</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold tabular-nums">97.4%</td>
                <td className="py-2.5 px-3 text-red-400 tabular-nums">2 Line Pauses</td>
                <td className="py-2.5 px-3 text-slate-400">2.6 Hours</td>
              </tr>
              <tr className="hover:bg-slate-850/50">
                <td className="py-2.5 px-3 text-white font-sans font-medium">Shift C (22:00 - 06:00)</td>
                <td className="py-2.5 px-3 tabular-nums">195 Units</td>
                <td className="py-2.5 px-3 text-amber-400 tabular-nums">3 Defects</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold tabular-nums">98.5%</td>
                <td className="py-2.5 px-3 text-slate-400 tabular-nums">0 Line Pauses</td>
                <td className="py-2.5 px-3 text-slate-400">1.5 Hours</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
