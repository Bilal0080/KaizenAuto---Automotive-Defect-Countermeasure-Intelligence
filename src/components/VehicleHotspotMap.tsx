import React, { useState } from 'react';
import { Defect, VehicleZone } from '../types';
import { AlertTriangle, CheckCircle, Crosshair, MapPin } from 'lucide-react';

interface VehicleHotspotMapProps {
  defects: Defect[];
  selectedZone: VehicleZone | null;
  onSelectZone: (zone: VehicleZone | null) => void;
  onLogDefectForZone: (zone: VehicleZone) => void;
}

const ZONES_CONFIG: {
  id: VehicleZone;
  label: string;
  cx: number;
  cy: number;
  view: 'top' | 'side';
  description: string;
}[] = [
  { id: 'front_bumper', label: 'Front Bumper / Fascia', cx: 70, cy: 120, view: 'top', description: 'Radar, front air intake, front lighting harness' },
  { id: 'hood_engine', label: 'Hood & Engine / Inverter Bay', cx: 130, cy: 120, view: 'top', description: 'Thermal system, high voltage inverter, hood latch & hinge' },
  { id: 'windshield', label: 'Windshield & A-Pillar', cx: 185, cy: 120, view: 'top', description: 'Optical ADAS camera, acoustic glass bond, wipers' },
  { id: 'doors_left', label: 'Driver Side Doors (LH)', cx: 250, cy: 75, view: 'top', description: 'Door seal, window regulator, latch striker, paint clearcoat' },
  { id: 'doors_right', label: 'Passenger Side Doors (RH)', cx: 250, cy: 165, view: 'top', description: 'Door weatherstrip, hinges, gap-and-flush margin' },
  { id: 'interior_cabin', label: 'Interior Cabin & Cockpit', cx: 250, cy: 120, view: 'top', description: 'Instrument cluster, steering column, center console, seating' },
  { id: 'roof', label: 'Roof Panel & Sunroof', cx: 280, cy: 120, view: 'top', description: 'Panoramic glass adhesive, roof rack braze weld, headliner' },
  { id: 'rear_trunk', label: 'Rear Trunk & Tailgate', cx: 375, cy: 120, view: 'top', description: 'Power liftgate motor, tail lamp seal, rear bumper skin' },
  { id: 'underbody_battery', label: 'Underbody & Battery Pack', cx: 250, cy: 260, view: 'side', description: 'HV Battery structural crossmember, torque bolting, skid shield' },
  { id: 'rear_suspension', label: 'Rear Axle & Brakes', cx: 350, cy: 270, view: 'side', description: 'Multi-link suspension, brake calipers, hydraulic bleeder' },
];

export const VehicleHotspotMap: React.FC<VehicleHotspotMapProps> = ({
  defects,
  selectedZone,
  onSelectZone,
  onLogDefectForZone,
}) => {
  const [hoveredZone, setHoveredZone] = useState<VehicleZone | null>(null);

  const getDefectsForZone = (zone: VehicleZone) => {
    return defects.filter((d) => d.vehicleZone === zone && d.status !== 'closed');
  };

  const activeZoneData = ZONES_CONFIG.find((z) => z.id === (selectedZone || hoveredZone));
  const activeDefects = activeZoneData ? getDefectsForZone(activeZoneData.id) : [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-white">
              Vehicle Inspection Wireframe & Defect Hotspots
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive CAD blueprint mapping defect density across body, powertrain, and chassis zones.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {selectedZone && (
            <button
              onClick={() => onSelectZone(null)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              Reset Filter
            </button>
          )}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              Critical
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Major
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              Minor
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* SVG Interactive Blueprint */}
        <div className="lg:col-span-8 bg-slate-950/90 rounded-xl border border-slate-800 p-4 relative overflow-hidden flex flex-col items-center">
          <div className="w-full flex justify-between text-[11px] font-mono text-slate-500 pb-2 border-b border-slate-900">
            <span>MODEL: PLATFORM-E01 (BEV SEDAN)</span>
            <span>TOP & CHASSIS PROFILE</span>
          </div>

          <div className="relative w-full max-w-xl aspect-[16/10] my-2">
            <svg
              viewBox="0 0 450 320"
              className="w-full h-full select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
                <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#334155" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Grid Background */}
              <rect width="450" height="320" fill="url(#grid)" />

              {/* Top View Schematic Car Body */}
              <g id="car-top-view" transform="translate(15, 0)">
                {/* Wheels Top */}
                <rect x="90" y="38" width="46" height="18" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                <rect x="90" y="184" width="46" height="18" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                <rect x="310" y="38" width="46" height="18" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                <rect x="310" y="184" width="46" height="18" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />

                {/* Car Silhouette Top */}
                <path
                  d="M 50 120 C 50 85, 75 55, 110 55 L 320 55 C 365 55, 395 80, 395 120 C 395 160, 365 185, 320 185 L 110 185 C 75 185, 50 155, 50 120 Z"
                  fill="url(#carBodyGrad)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  className="transition-all opacity-80"
                />

                {/* Windshield & Cabin Outline */}
                <path
                  d="M 160 65 L 195 72 L 195 168 L 160 175 Z"
                  fill="#0284c7"
                  fillOpacity="0.15"
                  stroke="#0284c7"
                  strokeWidth="1"
                />
                <rect x="195" y="70" width="100" height="100" rx="4" fill="#0f172a" fillOpacity="0.4" stroke="#64748b" strokeWidth="1" />
                <path
                  d="M 295 72 L 330 65 L 330 175 L 295 168 Z"
                  fill="#0284c7"
                  fillOpacity="0.15"
                  stroke="#0284c7"
                  strokeWidth="1"
                />

                {/* Hood Lines */}
                <path d="M 60 100 L 155 90 M 60 140 L 155 150" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                {/* Trunk Lines */}
                <path d="M 330 85 L 380 95 M 330 155 L 380 145" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
              </g>

              {/* Side View Chassis / Powertrain Schematic */}
              <g id="car-side-view" transform="translate(15, 0)">
                <text x="20" y="235" fill="#64748b" fontSize="10" fontFamily="monospace">
                  CHASSIS & BATTERY SUB-SECTION
                </text>
                {/* Ground Line */}
                <line x1="40" y1="305" x2="410" y2="305" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                {/* Wheels Side */}
                <circle cx="115" cy="285" r="18" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
                <circle cx="115" cy="285" r="8" fill="#334155" />
                <circle cx="335" cy="285" r="18" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
                <circle cx="335" cy="285" r="8" fill="#334155" />

                {/* Battery Pack Underbody */}
                <rect
                  x="145"
                  y="275"
                  width="160"
                  height="16"
                  rx="3"
                  fill="#0284c7"
                  fillOpacity="0.25"
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                />
                <text x="180" y="286" fill="#7dd3fc" fontSize="9" fontFamily="monospace">
                  800V TRACTION PACK
                </text>
                {/* Frame rails */}
                <path d="M 60 270 L 115 270 L 145 275 L 305 275 L 335 270 L 390 270" fill="none" stroke="#64748b" strokeWidth="2" />
              </g>

              {/* Hotspot Pins */}
              {ZONES_CONFIG.map((zone) => {
                const zoneDefects = getDefectsForZone(zone.id);
                const count = zoneDefects.length;
                const hasCritical = zoneDefects.some((d) => d.severity === 'critical');
                const isSelected = selectedZone === zone.id;
                const isHovered = hoveredZone === zone.id;

                let pinColor = '#38bdf8'; // minor/clean
                if (hasCritical) pinColor = '#ef4444'; // critical red
                else if (count > 0) pinColor = '#f59e0b'; // major amber

                return (
                  <g
                    key={zone.id}
                    className="cursor-pointer transition-transform"
                    onClick={() => onSelectZone(selectedZone === zone.id ? null : zone.id)}
                    onMouseEnter={() => setHoveredZone(zone.id)}
                    onMouseLeave={() => setHoveredZone(null)}
                  >
                    {/* Pulsing ring for critical or active */}
                    {(hasCritical || isSelected) && (
                      <circle
                        cx={zone.cx}
                        cy={zone.cy}
                        r={isSelected ? 16 : 13}
                        fill="none"
                        stroke={pinColor}
                        strokeWidth="1.5"
                        className="animate-ping opacity-75"
                      />
                    )}

                    {/* Outer Target Circle */}
                    <circle
                      cx={zone.cx}
                      cy={zone.cy}
                      r={isSelected || isHovered ? 13 : 10}
                      fill={isSelected ? pinColor : '#0f172a'}
                      stroke={pinColor}
                      strokeWidth={isSelected ? 2 : 1.5}
                      className="transition-all"
                    />

                    {/* Zone defect count or icon */}
                    <text
                      x={zone.cx}
                      y={zone.cy + 3.5}
                      fill={isSelected ? '#020617' : pinColor}
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="pointer-events-none select-none font-mono"
                    >
                      {count > 0 ? count : '·'}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Zone Deep Dive Panel */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-slate-950/60 border border-slate-800 rounded-xl p-5 h-full min-h-[300px]">
          {activeZoneData ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
                    Inspection Zone
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {activeDefects.length} Active Anomaly
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-1">
                  {activeZoneData.label}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {activeZoneData.description}
                </p>
              </div>

              {/* Defect list in this zone */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activeDefects.length > 0 ? (
                  activeDefects.map((d) => (
                    <div
                      key={d.id}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              d.severity === 'critical'
                                ? 'bg-red-500'
                                : d.severity === 'major'
                                ? 'bg-amber-500'
                                : 'bg-cyan-400'
                            }`}
                          />
                          <span className="font-semibold text-slate-200 truncate max-w-[160px]">
                            {d.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {d.station} · {d.vinOrUnitId}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">
                        {d.defectCode}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-center text-xs text-emerald-400">
                    <CheckCircle className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                    <span>No active defects reported on this zone. Nominal tolerance.</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => onLogDefectForZone(activeZoneData.id)}
                className="w-full mt-3 py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Crosshair className="w-4 h-4" />
                <span>Log Defect for {activeZoneData.label}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-8 text-slate-400 h-full">
              <MapPin className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-300">Select an Inspection Zone</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Hover or click on any hotspot pin on the car blueprint to inspect recorded defects or log a new line issue.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
