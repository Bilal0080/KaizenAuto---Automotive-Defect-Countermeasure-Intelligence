import React, { useState, useMemo } from 'react';
import { Defect, DefectSeverity, DefectStatus, DefectCategory, UserRole } from '../types/index.ts';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Activity, 
  ChevronRight, 
  FileText, 
  Zap,
  ArrowUpDown
} from 'lucide-react';

interface DefectListProps {
  defects: Defect[];
  currentUserRole: UserRole;
  onSelectDefect: (defect: Defect) => void;
  onOpenReport: (defect: Defect) => void;
  onAddNewDefect: () => void;
}

export const DefectList: React.FC<DefectListProps> = ({
  defects,
  currentUserRole,
  onSelectDefect,
  onOpenReport,
  onAddNewDefect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'severity' | 'station'>('date_desc');

  const filteredDefects = useMemo(() => {
    return defects.filter((defect) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        defect.defectCode.toLowerCase().includes(q) ||
        defect.title.toLowerCase().includes(q) ||
        defect.vinOrUnitId.toLowerCase().includes(q) ||
        (defect.partNumber && defect.partNumber.toLowerCase().includes(q)) ||
        defect.station.toLowerCase().includes(q) ||
        defect.reportedBy.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || defect.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || defect.severity === severityFilter;
      const matchesCategory = categoryFilter === 'all' || defect.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesSeverity && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'severity') {
        const score = { critical: 3, major: 2, minor: 1 };
        return score[b.severity] - score[a.severity];
      }
      if (sortBy === 'station') {
        return a.station.localeCompare(b.station);
      }
      return 0;
    });
  }, [defects, searchQuery, statusFilter, severityFilter, categoryFilter, sortBy]);

  const getSeverityStyle = (severity: DefectSeverity) => {
    switch (severity) {
      case 'critical':
        return 'text-rose-600 dark:text-rose-400 font-semibold';
      case 'major':
        return 'text-amber-600 dark:text-amber-400 font-medium';
      case 'minor':
        return 'text-blue-600 dark:text-blue-400 font-normal';
    }
  };

  const getStatusBadge = (status: DefectStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="font-mono text-[11px] px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            OPEN
          </span>
        );
      case 'investigating':
        return (
          <span className="font-mono text-[11px] px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            5-WHY ACTIVE
          </span>
        );
      case 'countermeasure_proposed':
        return (
          <span className="font-mono text-[11px] px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
            ICA/PCA PROPOSED
          </span>
        );
      case 'verified':
        return (
          <span className="font-mono text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            VERIFIED
          </span>
        );
      case 'closed':
        return (
          <span className="font-mono text-[11px] px-2 py-0.5 bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            CLOSED
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Control / Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by defect code, VIN, part #, station, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 font-mono"
            />
          </div>

          {/* Quick Action Button */}
          <button
            onClick={onAddNewDefect}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          >
            + Log New Defect
          </button>
        </div>

        {/* Filter Chips & Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[11px] mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>FILTERS:</span>
          </div>

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-mono"
          >
            <option value="all">All Statuses ({defects.length})</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating (5-Why)</option>
            <option value="countermeasure_proposed">Countermeasure Proposed</option>
            <option value="verified">Verified</option>
            <option value="closed">Closed</option>
          </select>

          {/* Severity dropdown */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-mono"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical (Line Stop)</option>
            <option value="major">Major (Rework Req)</option>
            <option value="minor">Minor (Touch-up)</option>
          </select>

          {/* Category dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-mono"
          >
            <option value="all">All Categories</option>
            <option value="Torque & Fastener">Torque & Fastener</option>
            <option value="Paint & Surface">Paint & Surface</option>
            <option value="Body & Welding">Body & Welding</option>
            <option value="Electrical & Harness">Electrical & Harness</option>
            <option value="Powertrain & Mechanical">Powertrain & Mechanical</option>
            <option value="Fluid & Leaks">Fluid & Leaks</option>
            <option value="Trim & Gap Flush">Trim & Gap Flush</option>
            <option value="Electronics & ADAS">Electronics & ADAS</option>
          </select>

          {/* Sort selector */}
          <div className="ml-auto flex items-center gap-1.5 font-mono text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-mono"
            >
              <option value="date_desc">Latest First</option>
              <option value="severity">Highest Severity</option>
              <option value="station">By Station</option>
            </select>
          </div>
        </div>
      </div>

      {/* Defect Cards List */}
      <div className="space-y-2">
        {filteredDefects.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              No defects match your current filter parameters.
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Reset your filters or click "+ Log New Defect" to record an issue.
            </p>
          </div>
        ) : (
          filteredDefects.map((defect) => {
            const hasFiveWhy = defect.fiveWhy && defect.fiveWhy.completed;
            const openCountermeasures = defect.countermeasures.filter((c) => c.status !== 'verified').length;

            return (
              <div
                key={defect.id}
                onClick={() => onSelectDefect(defect)}
                className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 p-4 transition-all cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  {/* Left Column: Code, Title, Metadata */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        {defect.defectCode}
                      </span>
                      {getStatusBadge(defect.status)}
                      <span className={`font-mono text-xs uppercase ${getSeverityStyle(defect.severity)}`}>
                        {defect.severity}
                      </span>

                      {defect.andonTriggered && defect.status !== 'closed' && (
                        <span className="flex items-center gap-1 font-mono text-[10px] bg-rose-600 text-white px-1.5 py-0.5 animate-pulse font-bold">
                          <Zap className="w-3 h-3" /> ANDON LINE STOP
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {defect.title}
                    </h3>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {defect.description}
                    </p>

                    {/* Industrial Unboxed Metadata Row */}
                    <div className="pt-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center gap-y-1 gap-x-2">
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">VIN: {defect.vinOrUnitId}</span>
                      <span>•</span>
                      <span>STATION: {defect.station}</span>
                      <span>•</span>
                      <span>CATEGORY: {defect.category}</span>
                      {defect.partNumber && (
                        <>
                          <span>•</span>
                          <span>PART: {defect.partNumber}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>REPORTED BY: {defect.reportedBy} ({defect.reportedByBadge})</span>
                      <span>•</span>
                      <span>{new Date(defect.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Right Column: 8D Progress Indicators & Actions */}
                  <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-zinc-100 dark:border-zinc-800">
                    <div className="text-right text-[11px] font-mono space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        <span>5-Why: {hasFiveWhy ? 'Done (L5)' : 'Pending'}</span>
                      </div>
                      <div className="text-zinc-500 dark:text-zinc-400">
                        Countermeasures: {defect.countermeasures.length} ({openCountermeasures} open)
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReport(defect);
                        }}
                        className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-mono flex items-center gap-1 transition-colors"
                        title="View Official 8D Report"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>8D Doc</span>
                      </button>

                      <div className="p-1 text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
