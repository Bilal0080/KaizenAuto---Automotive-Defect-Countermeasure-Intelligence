import React, { useState, useEffect } from 'react';
import { Defect, DefectCategory, DefectSeverity, UserProfile, VehicleZone } from '../types';
import { 
  X, 
  Camera, 
  Scan, 
  AlertOctagon, 
  Check, 
  Sparkles, 
  Upload, 
  Wrench,
  Cpu,
  Flame,
  Zap,
  Gauge,
  QrCode
} from 'lucide-react';
import { QrScannerModal } from './QrScannerModal';

interface DefectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (defect: Partial<Defect>) => void;
  currentUser: UserProfile;
  initialZone?: VehicleZone | null;
  initialVin?: string;
  initialPart?: string;
}

const CATEGORIES: { label: DefectCategory; icon: any }[] = [
  { label: 'Torque & Fastener', icon: Wrench },
  { label: 'Electrical & Harness', icon: Zap },
  { label: 'Paint & Surface', icon: Sparkles },
  { label: 'Body & Welding', icon: Flame },
  { label: 'Fluid & Leaks', icon: Gauge },
  { label: 'Trim & Gap Flush', icon: Check },
  { label: 'Powertrain & Mechanical', icon: Cpu },
  { label: 'Electronics & ADAS', icon: Scan },
];

const STATIONS = [
  'Station 06: Robotic Body Welding',
  'Station 08: Clearcoat Inspection Booth',
  'Station 14: Subframe Bolting & Torquing',
  'Station 18: Brake Fluid Fill & Bleed',
  'Station 22: High Voltage Harness & CPA',
  'Station 28: Cockpit & Dashboard Marriage',
  'Station 31: Exterior Gap & Flush Verification',
  'Station 35: End of Line Dynamic Roll Test',
  'Gate 3: Pre-Delivery Quality Audit',
];

const ZONES: { id: VehicleZone; label: string }[] = [
  { id: 'underbody_battery', label: 'Underbody & Battery' },
  { id: 'hood_engine', label: 'Hood & Front Bay' },
  { id: 'front_bumper', label: 'Front Bumper / Fascia' },
  { id: 'doors_left', label: 'Driver Doors (LH)' },
  { id: 'doors_right', label: 'Passenger Doors (RH)' },
  { id: 'interior_cabin', label: 'Interior Cabin' },
  { id: 'roof', label: 'Roof Panel' },
  { id: 'rear_trunk', label: 'Rear Trunk' },
  { id: 'rear_suspension', label: 'Rear Axle & Brakes' },
  { id: 'windshield', label: 'Windshield & A-Pillar' },
];

export const DefectModal: React.FC<DefectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  initialZone,
  initialVin,
  initialPart,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DefectCategory>('Torque & Fastener');
  const [severity, setSeverity] = useState<DefectSeverity>('major');
  const [station, setStation] = useState(currentUser.station || STATIONS[2]);
  const [line, setLine] = useState('Chassis Line 2');
  const [vehicleZone, setVehicleZone] = useState<VehicleZone>(initialZone || 'underbody_battery');
  const [vinOrUnitId, setVinOrUnitId] = useState(initialVin || `VIN-WAUZZZ-${Math.floor(10000 + Math.random() * 90000)}`);
  const [partNumber, setPartNumber] = useState(initialPart || 'N-911-470-01');
  const [andonTriggered, setAndonTriggered] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<'vin' | 'part'>('vin');

  useEffect(() => {
    if (initialVin) setVinOrUnitId(initialVin);
    if (initialPart) setPartNumber(initialPart);
  }, [initialVin, initialPart]);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    setVinOrUnitId(`VIN-WAUZZZ-${randomSuffix}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newDefect: Partial<Defect> = {
      defectCode: `DEF-2026-${Math.floor(100 + Math.random() * 900)}`,
      title,
      description: description || title,
      category,
      severity,
      status: 'open',
      line,
      station,
      vehicleZone,
      vinOrUnitId,
      partNumber,
      reportedBy: currentUser.name,
      reportedByBadge: currentUser.badgeId,
      andonTriggered: severity === 'critical' ? true : andonTriggered,
      imageUrl,
      countermeasures: [],
      comments: [
        {
          id: `c-${Date.now()}`,
          author: currentUser.name,
          role: currentUser.role,
          text: `Defect logged at ${station}. Initial status: Open.`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    onSubmit(newDefect);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-slate-100">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Log Automotive Defect / Incident</h2>
              <p className="text-xs text-slate-400">
                Reporter: {currentUser.name} ({currentUser.badgeId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Defect Severity Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSeverity('critical');
                  setAndonTriggered(true);
                }}
                className={`py-3 px-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  severity === 'critical'
                    ? 'bg-red-950/40 border-red-500 text-red-200 ring-1 ring-red-500'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">CRITICAL</span>
                  <AlertOctagon className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-[11px] text-slate-400 mt-1">
                  Stop the line / Andon alert
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSeverity('major')}
                className={`py-3 px-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  severity === 'major'
                    ? 'bg-amber-950/40 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">MAJOR</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                </div>
                <span className="text-[11px] text-slate-400 mt-1">
                  Immediate containment required
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSeverity('minor')}
                className={`py-3 px-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  severity === 'minor'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">MINOR</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                </div>
                <span className="text-[11px] text-slate-400 mt-1">
                  Kaizen log / rework in buffer
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Defect Discipline / Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCategory(cat.label)}
                    className={`p-2.5 rounded-lg border text-left text-xs flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Defect Title / Problem Statement *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Front Subframe M14 Bolt under-torqued at 82 Nm"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observation & Symptom Details
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe exact observation, gauge reading, visual anomaly, or diagnostic code..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assembly Station
              </label>
              <select
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                {STATIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Vehicle Inspection Zone
              </label>
              <select
                value={vehicleZone}
                onChange={(e) => setVehicleZone(e.target.value as VehicleZone)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                {ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Vehicle VIN / Chassis ID
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setScannerTarget('vin');
                      setIsScannerOpen(true);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan VIN Tag</span>
                  </button>
                  <span className="text-slate-600">·</span>
                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    className="text-[11px] text-slate-400 hover:text-slate-300"
                  >
                    Random
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={vinOrUnitId}
                onChange={(e) => setVinOrUnitId(e.target.value)}
                className="w-full bg-slate-950 font-mono border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Part / Subassembly Number
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setScannerTarget('part');
                    setIsScannerOpen(true);
                  }}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>Scan Part Barcode</span>
                </button>
              </div>
              <input
                type="text"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                placeholder="e.g. P-8092-HV"
                className="w-full bg-slate-950 font-mono border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className={`w-5 h-5 ${andonTriggered ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} />
              <div>
                <p className="text-xs font-semibold text-white">Andon Pull (Line Stop Signal)</p>
                <p className="text-[11px] text-slate-400">Instantly alerts shift supervisor and lights station beacon</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAndonTriggered(!andonTriggered)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                andonTriggered
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {andonTriggered ? 'ANDON PULLED' : 'ENABLE ANDON'}
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all rounded-lg shadow-md"
            >
              Log Defect & Initiate 8D Triage
            </button>
          </div>
        </form>
      </div>

      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        defaultMode={scannerTarget}
        onScanComplete={(scanned) => {
          if (scannerTarget === 'vin') {
            setVinOrUnitId(scanned.code);
          } else {
            setPartNumber(scanned.code);
          }
        }}
      />
    </div>
  );
};
