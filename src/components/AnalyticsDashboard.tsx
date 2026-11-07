import React, { useMemo } from 'react';
import { Defect, DefectCategory } from '../types/index.ts';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Layers,
  Percent,
  Download
} from 'lucide-react';

interface AnalyticsDashboardProps {
  defects: Defect[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ defects }) => {
  // Calculations
  const stats = useMemo(() => {
    const total = defects.length;
    const closed = defects.filter((d) => d.status === 'closed' || d.status === 'verified').length;
    const open = defects.filter((d) => d.status !== 'closed' && d.status !== 'verified').length;
    const critical = defects.filter((d) => d.severity === 'critical' && d.status !== 'closed').length;
    const andonStops = defects.filter((d) => d.andonTriggered).length;

    // FTQ Calculation (First Time Quality / Yield assumption based on total units inspected)
    const assumedBatchSize = 120;
    const unitsWithDefects = new Set(defects.map((d) => d.vinOrUnitId)).size;
    const ftqPercent = Math.max(0, Math.min(100, Number((((assumedBatchSize - unitsWithDefects) / assumedBatchSize) * 100).toFixed(1))));

    // Average MTTR (Mean Time to Resolution)
    const closedWithTime = defects.filter((d) => d.resolutionTimeHours);
    const avgMttr = closedWithTime.length > 0
      ? (closedWithTime.reduce((acc, curr) => acc + (curr.resolutionTimeHours || 0), 0) / closedWithTime.length).toFixed(1)
      : '3.4';

    // Pareto 80/20 Defect Categories Count
    const categoryCounts: Record<string, number> = {};
    defects.forEach((d) => {
      categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
    });

    const paretoCategories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    let cumulative = 0;
    const paretoWithPercentages = paretoCategories.map((item) => {
      cumulative += item.count;
      const percent = total > 0 ? (cumulative / total) * 100 : 0;
      return {
        ...item,
        percentage: percent.toFixed(0),
      };
    });

    // Station Distribution
    const stationCounts: Record<string, number> = {};
    defects.forEach((d) => {
      stationCounts[d.station] = (stationCounts[d.station] || 0) + 1;
    });

    const stationList = Object.entries(stationCounts)
      .map(([station, count]) => ({ station, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      closed,
      open,
      critical,
      andonStops,
      ftqPercent,
      avgMttr,
      paretoWithPercentages,
      stationList,
    };
  }, [defects]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4">
          <div className="flex items-center justify-between text-zinc-500 font-mono text-xs">
            <span>FIRST TIME QUALITY (FTQ)</span>
            <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {stats.ftqPercent}%
          </div>
          <div className="mt-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            ▲ +1.4% vs Last Shift
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4">
          <div className="flex items-center justify-between text-zinc-500 font-mono text-xs">
            <span>ACTIVE DEFECTS</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {stats.open}
          </div>
          <div className="mt-1 text-[11px] font-mono text-rose-600 dark:text-rose-400">
            {stats.critical} Critical Severity
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4">
          <div className="flex items-center justify-between text-zinc-500 font-mono text-xs">
            <span>MEAN TIME TO RESOLVE</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {stats.avgMttr} hrs
          </div>
          <div className="mt-1 text-[11px] font-mono text-zinc-500">
            IATF 16949 SLA: &lt; 24h
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4">
          <div className="flex items-center justify-between text-zinc-500 font-mono text-xs">
            <span>ANDON LINE EVENTS</span>
            <Zap className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {stats.andonStops}
          </div>
          <div className="mt-1 text-[11px] font-mono text-zinc-500">
            Total Stop Downtime: 22m
          </div>
        </div>
      </div>

      {/* Main Grid: Pareto 80/20 & Station Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Pareto 80/20 Defect Analysis */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Pareto 80/20 Analysis (Vital Few Defect Drivers)
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Target top categories to eliminate 80% of line rework.
              </p>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              Total: {stats.total}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {stats.paretoWithPercentages.map((item, index) => {
              const maxCount = stats.paretoWithPercentages[0]?.count || 1;
              const barWidth = Math.max(5, (item.count / maxCount) * 100);
              const isVitalFew = index < 3;

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <span className={`w-2 h-2 ${isVitalFew ? 'bg-rose-500' : 'bg-zinc-400'}`} />
                      {item.name}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {item.count} defects ({item.percentage}% cumulative)
                    </span>
                  </div>

                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-3 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isVitalFew ? 'bg-rose-600 dark:bg-rose-500' : 'bg-emerald-600 dark:bg-emerald-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Station Breakdown & Heatmap */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Station Quality Distribution
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Defect frequency across line workstations.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {stats.stationList.map((st) => (
              <div
                key={st.station}
                className="p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {st.station}
                  </div>
                  <div className="text-[11px] text-zinc-500">Main Assembly Line A</div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {st.count}
                  </span>
                  <div className="text-[10px] font-mono text-zinc-400">
                    {((st.count / (stats.total || 1)) * 100).toFixed(0)}% of total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Shift Comparison Matrix */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-5 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
          Plant Shift Performance Matrix (Shift A vs Shift B vs Shift C)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-zinc-100 dark:bg-zinc-800/60 font-mono text-zinc-600 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th className="p-3">Shift & Hours</th>
                <th className="p-3">Units Produced</th>
                <th className="p-3">Defects Logged</th>
                <th className="p-3">FTQ %</th>
                <th className="p-3">Line Stops</th>
                <th className="p-3">Supervisor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr>
                <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100 font-mono">Shift A (06:00 - 14:00)</td>
                <td className="p-3 font-mono">148 Units</td>
                <td className="p-3 font-mono text-rose-600">4 Defects</td>
                <td className="p-3 font-mono text-emerald-600 font-bold">97.3%</td>
                <td className="p-3 font-mono">1 (4m)</td>
                <td className="p-3">K. Schmidt</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100 font-mono">Shift B (14:00 - 22:00)</td>
                <td className="p-3 font-mono">152 Units</td>
                <td className="p-3 font-mono text-amber-600">6 Defects</td>
                <td className="p-3 font-mono text-emerald-600 font-bold">96.0%</td>
                <td className="p-3 font-mono">2 (11m)</td>
                <td className="p-3">T. Tanaka</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100 font-mono">Shift C (22:00 - 06:00)</td>
                <td className="p-3 font-mono">118 Units</td>
                <td className="p-3 font-mono text-rose-600">3 Defects</td>
                <td className="p-3 font-mono text-emerald-600 font-bold">97.4%</td>
                <td className="p-3 font-mono">0 (0m)</td>
                <td className="p-3">M. Tariq</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
