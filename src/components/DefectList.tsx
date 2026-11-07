import React, { useState, useMemo } from 'react';
import { Defect, DefectSeverity, DefectStatus, VehicleZone } from '../types';
import { 
  Search, 
  Filter, 
  AlertOctagon, 
  ChevronRight, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Wrench,
  Trash2
} from 'lucide-react';

interface DefectListProps {
  defects: Defect[];
  onSelectDefect: (defect: Defect) => void;
  onDeleteDefect: (id: string) => void;
  filterZone: VehicleZone | null;
  onClearZoneFilter: () => void;
}

export const DefectList: React.FC<DefectListProps> = ({
  defects,
  onSelectDefect,
  onDeleteDefect,
  filterZone,
  onClearZoneFilter,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredDefects = useMemo(() => {
    return defects.filter((d) => {
      // Zone filter
      if (filterZone && d.vehicleZone !== filterZone) return false;

      // Severity filter
      if (selectedSeverity !== 'all' && d.severity !== selectedSeverity) return false;

      // Status filter
      if (selectedStatus !== 'all' && d.status !== selectedStatus) return false;

      // Category filter
      if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;

      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          d.title.toLowerCase().includes(q) ||
          d.defectCode.toLowerCase().includes(q) ||
          d.vinOrUnitId.toLowerCase().includes(q) ||
          d.station.toLowerCase().includes(q) ||
          (d.partNumber && d.partNumber.toLowerCase().includes(q)) ||
          d.reportedBy.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [defects, filterZone, selectedSeverity, selectedStatus, selectedCategory, search]);

  const severityBadge = (sev: DefectSeverity) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" />
            CRITICAL
          </span>
        );
      case 'major':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            MAJOR
          </span>
        );
      case 'minor':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            MINOR
          </span>
        );
    }
  };

  const statusLabel = (st: DefectStatus) => {
    switch (st) {
      case 'open':
        return 'Open / Triage';
      case 'investigating':
        return '5-Why Investigating';
      case 'countermeasure_proposed':
        return 'Countermeasure Active';
      case 'verified':
        return 'Verified & Tested';
      case 'closed':
        return 'Closed';
    }
  };

  return (
    <div className="space-y-4">
      {/* Zone Active Filter Banner */}
      {filterZone && (
        <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <Filter className="w-4 h-4" />
            <span>Filtering defects for zone: <strong>{filterZone.replace('_', ' ').toUpperCase()}</strong></span>
          </div>
          <button
            onClick={onClearZoneFilter}
            className="text-xs text-amber-400 hover:underline font-medium"
          >
            Show All Zones
          </button>
        </div>
      )}

      {/* Control Bar: Search & Filters */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by defect code, title, VIN, station, part number..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical (Stop Line)</option>
              <option value="major">Major (Containment)</option>
              <option value="minor">Minor (Kaizen)</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="countermeasure_proposed">Countermeasure Proposed</option>
              <option value="verified">Verified</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Status Tab Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-800/80 text-xs">
          {[
            { id: 'all', label: 'All Defects' },
            { id: 'open', label: 'Open' },
            { id: 'investigating', label: '5-Why In Progress' },
            { id: 'countermeasure_proposed', label: 'Countermeasure Proposed' },
            { id: 'verified', label: 'Verified' },
            { id: 'closed', label: 'Closed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors text-xs ${
                selectedStatus === tab.id
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Defect Cards List */}
      <div className="space-y-2.5">
        {filteredDefects.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
            No defects found matching your filters.
          </div>
        ) : (
          filteredDefects.map((d) => (
            <div
              key={d.id}
              onClick={() => onSelectDefect(d)}
              className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                {/* Unboxed Metadata row with typographic separators */}
                <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400">
                  {severityBadge(d.severity)}
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="font-mono text-amber-400 font-semibold">{d.defectCode}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>{d.category}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="font-mono text-slate-300">{d.vinOrUnitId}</span>
                  {d.andonTriggered && (
                    <>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-red-400 font-bold text-[11px] flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3" />
                        Andon Pulled
                      </span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                  {d.title}
                </h3>

                {/* Sub info */}
                <div className="flex items-center flex-wrap gap-2 text-[11px] text-slate-400">
                  <span>Station: <strong className="text-slate-300 font-normal">{d.station}</strong></span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>Reported by: <strong className="text-slate-300 font-normal">{d.reportedBy}</strong></span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Status & Countermeasures Summary */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200">
                    {statusLabel(d.status)}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                    <Wrench className="w-3 h-3 text-amber-400" />
                    <span>{d.countermeasures.length} Countermeasures</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this defect log?')) {
                        onDeleteDefect(d.id);
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete defect"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="p-2 text-slate-400 group-hover:text-amber-400 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
