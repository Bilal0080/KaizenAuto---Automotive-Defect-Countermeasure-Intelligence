import React, { useState } from 'react';
import { VehicleZone, Defect } from '../types/index.ts';
import { ShieldAlert, AlertTriangle, CheckCircle2, Crosshair, ZoomIn } from 'lucide-react';

interface VehicleHotspotMapProps {
  defects: Defect[];
  selectedZone: VehicleZone | 'all';
  onSelectZone: (zone: VehicleZone | 'all') => void;
  onQuickLogForZone: (zone: VehicleZone) => void;
}

interface ZoneHotspot {
  id: VehicleZone;
  label: string;
  code: string;
  cx: number;
  cy: number;
  r: number;
  view: 'top' | 'side' | 'isometric';
}

const HOTSPOTS: ZoneHotspot[] = [
  { id: 'front_bumper', label: 'Front Fascia / Bumper', code: 'Z-01', cx: 80, cy: 150, r: 24, view: 'top' },
  { id: 'hood_engine', label: 'Hood & Powertrain Bay', code: 'Z-02', cx: 165, cy: 150, r: 28, view: 'top' },
  { id: 'windshield', label: 'Windshield & A-Pillar', code: 'Z-03', cx: 235, cy: 150, r: 22, view: 'top' },
  { id: 'doors_left', label: 'Doors & BIW (Port)', code: 'Z-04', cx: 310, cy: 90, r: 24, view: 'top' },
  { id: 'doors_right', label: 'Doors & BIW (Starboard)', code: 'Z-05', cx: 310, cy: 210, r: 24, view: 'top' },
  { id: 'roof', label: 'Roof Panel & Sunroof', code: 'Z-06', cx: 310, cy: 150, r: 26, view: 'top' },
  { id: 'interior_cabin', label: 'Cockpit & Instrument Cluster', code: 'Z-07', cx: 265, cy: 150, r: 22, view: 'top' },
  { id: 'underbody_battery', label: 'EV Battery Tray / Floor Pan', code: 'Z-08', cx: 375, cy: 150, r: 24, view: 'top' },
  { id: 'rear_trunk', label: 'Rear Tailgate & Bumper', code: 'Z-09', cx: 450, cy: 150, r: 24, view: 'top' },
  { id: 'rear_suspension', label: 'Rear Axle & Brake Assembly', code: 'Z-10', cx: 415, cy: 85, r: 20, view: 'top' },
];

export const VehicleHotspotMap: React.FC<VehicleHotspotMapProps> = ({
  defects,
  selectedZone,
  onSelectZone,
  onQuickLogForZone,
}) => {
  const [hoveredZone, setHoveredZone] = useState<VehicleZone | null>(null);

  const getDefectsForZone = (zoneId: VehicleZone) => {
    return defects.filter((d) => d.vehicleZone === zoneId && d.status !== 'closed');
  };

  const getZoneStatus = (zoneId: VehicleZone) => {
    const zoneDefects = getDefectsForZone(zoneId);
    if (zoneDefects.length === 0) return 'normal';
    if (zoneDefects.some((d) => d.severity === 'critical')) return 'critical';
    return 'warning';
  };

  const activeZoneData = HOTSPOTS.find((h) => h.id === (hoveredZone || (selectedZone !== 'all' ? selectedZone : null)));
  const activeZoneDefects = activeZoneData ? getDefectsForZone(activeZoneData.id) : [];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-900 dark:text-zinc-100 font-mono">
              Vehicle CAD Inspection Hotspots (Top View Blueprint)
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Click on any zone to isolate defects or log in-station inspection findings.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => onSelectZone('all')}
            className={`px-3 py-1.5 font-mono text-xs border transition-colors ${
              selectedZone === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-semibold'
                : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400'
            }`}
          >
            Show All Zones
          </button>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 inline-block"></span> Pass
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-500 inline-block"></span> Issue ({defects.filter((d) => d.severity === 'major' && d.status !== 'closed').length})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-rose-600 inline-block animate-pulse"></span> Critical ({defects.filter((d) => d.severity === 'critical' && d.status !== 'closed').length})
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Blueprint Canvas */}
        <div className="lg:col-span-8 bg-zinc-950 border border-zinc-800 p-4 relative overflow-hidden flex items-center justify-center">
          {/* Subtle grid pattern background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <svg
            viewBox="0 0 540 300"
            className="w-full max-w-2xl h-auto drop-shadow-xl select-none"
          >
            <defs>
              <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Vehicle Chassis Outline (Top-Down Silhouette) */}
            <g stroke="#475569" strokeWidth="2" fill="url(#bodyGrad)">
              {/* Outer Car Body Boundary */}
              <path
                d="M 60 150 
                   C 60 120, 80 90, 130 85 
                   L 200 85 
                   C 220 85, 230 75, 250 75 
                   L 370 75 
                   C 395 75, 410 85, 435 85 
                   L 470 95 
                   C 500 110, 500 190, 470 205 
                   L 435 215 
                   C 410 215, 395 225, 370 225 
                   L 250 225 
                   C 230 225, 220 215, 200 215 
                   L 130 215 
                   C 80 210, 60 180, 60 150 Z"
              />

              {/* Windshield & Glass Greenhouse */}
              <path
                d="M 215 100 L 250 95 L 370 95 L 400 105 L 390 195 L 370 205 L 250 205 L 215 200 Z"
                fill="#0f172a"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />

              {/* Roof Section */}
              <rect x="255" y="105" width="115" height="90" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth="1" />

              {/* Wheel Arches & Tires */}
              <rect x="125" y="65" width="55" height="18" rx="4" fill="#090d16" stroke="#0ea5e9" strokeWidth="1.5" />
              <rect x="125" y="217" width="55" height="18" rx="4" fill="#090d16" stroke="#0ea5e9" strokeWidth="1.5" />
              <rect x="385" y="65" width="55" height="18" rx="4" fill="#090d16" stroke="#0ea5e9" strokeWidth="1.5" />
              <rect x="385" y="217" width="55" height="18" rx="4" fill="#090d16" stroke="#0ea5e9" strokeWidth="1.5" />

              {/* Center Line Axis */}
              <line x1="50" y1="150" x2="510" y2="150" stroke="#334155" strokeWidth="1" strokeDasharray="6 4" />
            </g>

            {/* Clickable Hotspot Circles */}
            {HOTSPOTS.map((hotspot) => {
              const status = getZoneStatus(hotspot.id);
              const count = getDefectsForZone(hotspot.id).length;
              const isSelected = selectedZone === hotspot.id;
              const isHovered = hoveredZone === hotspot.id;

              let fillColor = 'rgba(16, 185, 129, 0.25)';
              let strokeColor = '#10b981';
              let ringColor = 'rgba(16, 185, 129, 0.4)';

              if (status === 'critical') {
                fillColor = 'rgba(225, 29, 72, 0.45)';
                strokeColor = '#f43f5e';
                ringColor = 'rgba(244, 63, 94, 0.6)';
              } else if (status === 'warning') {
                fillColor = 'rgba(245, 158, 11, 0.35)';
                strokeColor = '#f59e0b';
                ringColor = 'rgba(245, 158, 11, 0.5)';
              }

              return (
                <g
                  key={hotspot.id}
                  className="cursor-pointer transition-all duration-150"
                  onClick={() => onSelectZone(isSelected ? 'all' : hotspot.id)}
                  onMouseEnter={() => setHoveredZone(hotspot.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                >
                  {/* Outer pulse wave for critical issues */}
                  {status === 'critical' && (
                    <circle
                      cx={hotspot.cx}
                      cy={hotspot.cy}
                      r={hotspot.r + 6}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      className="animate-spin"
                    />
                  )}

                  {/* Selection Highlight */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={hotspot.cx}
                      cy={hotspot.cy}
                      r={hotspot.r + 4}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />
                  )}

                  {/* Main Hotspot Circle */}
                  <circle
                    cx={hotspot.cx}
                    cy={hotspot.cy}
                    r={hotspot.r}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                  />

                  {/* Zone Indicator Text */}
                  <text
                    x={hotspot.cx}
                    y={hotspot.cy - 2}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {hotspot.code}
                  </text>

                  {/* Count Badge inside Hotspot */}
                  <text
                    x={hotspot.cx}
                    y={hotspot.cy + 9}
                    textAnchor="middle"
                    fill={count > 0 ? '#ffffff' : '#94a3b8'}
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight={count > 0 ? 'bold' : 'normal'}
                    pointerEvents="none"
                  >
                    {count > 0 ? `${count} DEF` : 'OK'}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick HUD legend on top right of canvas */}
          <div className="absolute bottom-2 right-2 bg-zinc-900/90 border border-zinc-700/80 px-2.5 py-1 text-[11px] font-mono text-zinc-300 flex items-center gap-2 backdrop-blur-sm">
            <ZoomIn className="w-3.5 h-3.5 text-zinc-400" />
            <span>VIN: 1HGCR2F83HA02914</span>
          </div>
        </div>

        {/* Zone Details / Inspector Side Panel */}
        <div className="lg:col-span-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-4">
          {activeZoneData ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                    {activeZoneData.code}
                  </span>
                  <span
                    className={`font-mono text-xs font-semibold ${
                      activeZoneDefects.some((d) => d.severity === 'critical')
                        ? 'text-rose-600 dark:text-rose-400'
                        : activeZoneDefects.length > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {activeZoneDefects.length === 0
                      ? 'ALL CLEAR (PASS)'
                      : `${activeZoneDefects.length} ACTIVE DEFECTS`}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  {activeZoneData.label}
                </h3>
              </div>

              {/* Action button to log new defect directly into this zone */}
              <button
                onClick={() => onQuickLogForZone(activeZoneData.id)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider font-mono flex items-center justify-center gap-1.5 transition-colors"
              >
                + Log Defect in {activeZoneData.code}
              </button>

              {/* Defect items list in this zone */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeZoneDefects.length === 0 ? (
                  <div className="text-center py-6 text-zinc-400 dark:text-zinc-500 text-xs font-mono">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500 opacity-60" />
                    Zero defects logged in this zone for current shift.
                  </div>
                ) : (
                  activeZoneDefects.map((defect) => (
                    <div
                      key={defect.id}
                      className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{defect.defectCode}</span>
                        <span
                          className={`uppercase font-semibold ${
                            defect.severity === 'critical'
                              ? 'text-rose-600'
                              : defect.severity === 'major'
                              ? 'text-amber-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {defect.severity}
                        </span>
                      </div>
                      <p className="text-zinc-800 dark:text-zinc-200 line-clamp-1 font-medium">
                        {defect.title}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                        <span>{defect.station}</span>
                        <span>{defect.category}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs">
              Hover or select a zone on the vehicle wireframe to view station status and log defects.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
