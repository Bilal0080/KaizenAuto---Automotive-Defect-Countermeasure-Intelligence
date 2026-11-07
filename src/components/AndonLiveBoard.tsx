import React, { useState, useEffect } from 'react';
import { Defect, NotificationAlert } from '../types/index.ts';
import { 
  Zap, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2,
  Bell
} from 'lucide-react';

interface ScheduledReminder {
  id: string;
  title: string;
  station: string;
  targetTime: string;
  priority: 'critical' | 'high' | 'normal';
  note: string;
  completed: boolean;
}

interface AndonLiveBoardProps {
  defects: Defect[];
  notifications: NotificationAlert[];
  onResolveAndon: (defectId: string) => void;
  onAddNotification: (alert: Omit<NotificationAlert, 'id' | 'timestamp' | 'read'>) => void;
}

const LINE_STATIONS = [
  { id: 'ST-01', name: 'Station 01: BIW Framing & Hemming', zone: 'doors_left' },
  { id: 'ST-02', name: 'Station 02: Underbody Battery Insertion', zone: 'underbody_battery' },
  { id: 'ST-03', name: 'Station 03: Engine & Powertrain Decking', zone: 'hood_engine' },
  { id: 'ST-04', name: 'Station 04: Suspension & Brake Line Torque', zone: 'rear_suspension' },
  { id: 'ST-05', name: 'Station 05: Instrument Panel & Harness', zone: 'interior_cabin' },
  { id: 'ST-06', name: 'Station 06: Paint Inspection & Clearcoat', zone: 'roof' },
  { id: 'ST-07', name: 'Station 07: Front & Rear Glass Bonding', zone: 'windshield' },
  { id: 'ST-08', name: 'Station 08: End of Line (EOL) Dyno & ADAS', zone: 'front_bumper' },
];

export const AndonLiveBoard: React.FC<AndonLiveBoardProps> = ({
  defects,
  notifications,
  onResolveAndon,
  onAddNotification,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [reminders, setReminders] = useState<ScheduledReminder[]>([
    {
      id: 'rem_1',
      title: 'Torque Spindle Calibration Check',
      station: 'ST-04',
      targetTime: '15:30',
      priority: 'critical',
      note: 'Perform 10-cycle digital audit on right-hand caliper bolts',
      completed: false,
    },
    {
      id: 'rem_2',
      title: 'Cleanroom Paint Filter Differential Pressure',
      station: 'ST-06',
      targetTime: '16:00',
      priority: 'high',
      note: 'Log pressure drop across primary plenum filter bank',
      completed: false,
    },
  ]);

  const [newReminder, setNewReminder] = useState({
    title: '',
    station: 'ST-01',
    targetTime: '16:30',
    priority: 'high' as const,
    note: '',
  });
  const [showAddReminder, setShowAddReminder] = useState(false);

  // Synthesize Andon Industrial Buzzer using Web Audio API
  const playAndonTone = (frequency = 440, type: OscillatorType = 'sawtooth') => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.8, audioCtx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // AudioContext policy handled gracefully
    }
  };

  const activeAndonDefects = defects.filter((d) => d.andonTriggered && d.status !== 'closed');

  // Trigger sound when critical line stop occurs
  useEffect(() => {
    if (activeAndonDefects.length > 0 && audioEnabled) {
      playAndonTone(580, 'sawtooth');
    }
  }, [activeAndonDefects.length, audioEnabled]);

  const handleAddCustomReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.title.trim()) return;

    const item: ScheduledReminder = {
      id: 'rem_' + Date.now(),
      title: newReminder.title.trim(),
      station: newReminder.station,
      targetTime: newReminder.targetTime,
      priority: newReminder.priority,
      note: newReminder.note.trim(),
      completed: false,
    };

    setReminders([...reminders, item]);
    onAddNotification({
      title: `Reminder Scheduled: ${item.title}`,
      message: `Due at ${item.targetTime} for ${item.station}. ${item.note}`,
      severity: item.priority === 'critical' ? 'critical' : 'warning',
      station: item.station,
    });

    setNewReminder({
      title: '',
      station: 'ST-01',
      targetTime: '16:30',
      priority: 'high',
      note: '',
    });
    setShowAddReminder(false);
  };

  const handleToggleReminder = (id: string) => {
    setReminders(reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)));
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Controls: Audio & Status */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className={`w-5 h-5 ${activeAndonDefects.length > 0 ? 'text-rose-600 animate-pulse' : 'text-emerald-500'}`} />
          <div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Live Factory Andon Board & Automated Line Escalation
            </h2>
            <p className="text-xs text-zinc-500">
              Real-time line status, buzzer telemetry, and supervisor alert protocol.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (!audioEnabled) playAndonTone(880, 'sine');
            }}
            className={`px-3 py-1.5 text-xs font-mono font-semibold flex items-center gap-1.5 border transition-colors ${
              audioEnabled
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{audioEnabled ? 'Andon Buzzer ON' : 'Buzzer Muted'}</span>
          </button>
        </div>
      </div>

      {/* Active Line Stops Banner if any */}
      {activeAndonDefects.length > 0 && (
        <div className="p-4 bg-rose-600 text-white border-2 border-rose-700 space-y-2 animate-pulse">
          <div className="flex items-center justify-between font-mono text-xs font-bold uppercase">
            <span className="flex items-center gap-2 text-sm">
              <Zap className="w-5 h-5" />
              CRITICAL ANDON LINE STOP IN EFFECT ({activeAndonDefects.length} ACTIVE)
            </span>
            <span>SUPERVISOR IMMEDIATE DISPATCH</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {activeAndonDefects.map((def) => (
              <div
                key={def.id}
                className="p-2 bg-rose-900/60 border border-rose-400/40 flex items-center justify-between text-xs font-sans"
              >
                <div>
                  <span className="font-mono font-bold mr-2">[{def.station}] {def.defectCode}</span>
                  <span>{def.title}</span>
                </div>
                <button
                  onClick={() => onResolveAndon(def.id)}
                  className="px-3 py-1 bg-white text-rose-900 font-mono text-xs font-bold uppercase hover:bg-rose-100"
                >
                  Clear & Resume Line
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Digital Station Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {LINE_STATIONS.map((station) => {
          const stationDefects = defects.filter(
            (d) => d.station.toLowerCase().includes(station.id.toLowerCase()) && d.status !== 'closed'
          );
          const hasAndon = stationDefects.some((d) => d.andonTriggered);
          const hasCritical = stationDefects.some((d) => d.severity === 'critical');

          let cardBorder = 'border-emerald-500 dark:border-emerald-600';
          let statusText = 'LINE RUNNING - NORMAL';
          let statusBg = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300';
          let lightColor = 'bg-emerald-500';

          if (hasAndon) {
            cardBorder = 'border-rose-600 dark:border-rose-500';
            statusText = 'LINE STOP - ANDON PULLED';
            statusBg = 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 animate-pulse';
            lightColor = 'bg-rose-600 animate-ping';
          } else if (hasCritical || stationDefects.length > 0) {
            cardBorder = 'border-amber-500 dark:border-amber-600';
            statusText = 'CAUTION - DEFECT REPORTED';
            statusBg = 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300';
            lightColor = 'bg-amber-500';
          }

          return (
            <div
              key={station.id}
              className={`bg-white dark:bg-zinc-900 border-2 ${cardBorder} p-4 flex flex-col justify-between space-y-3`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {station.id}
                  </span>
                  <span className={`w-3 h-3 ${lightColor} inline-block`} />
                </div>
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-2">
                  {station.name}
                </h3>
              </div>

              <div className="space-y-2">
                <div className={`p-1.5 font-mono text-[10px] uppercase font-bold text-center ${statusBg}`}>
                  {statusText}
                </div>
                <div className="text-[11px] font-mono text-zinc-500 flex justify-between">
                  <span>Open Issues: {stationDefects.length}</span>
                  <span>Takt Time: 58s</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task & Reminder Scheduling Module */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 gap-2">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Scheduled Quality Audits & Urgent Task Reminders
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Automated reminders and custom alert scheduling for critical plant tasks.
            </p>
          </div>

          <button
            onClick={() => setShowAddReminder(!showAddReminder)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddReminder ? 'Cancel' : '+ Schedule Reminder'}</span>
          </button>
        </div>

        {/* Schedule Form */}
        {showAddReminder && (
          <form
            onSubmit={handleAddCustomReminder}
            className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">Station</label>
                <select
                  value={newReminder.station}
                  onChange={(e) => setNewReminder({ ...newReminder, station: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono"
                >
                  {LINE_STATIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} - {s.name.split(':')[1] || s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">Target Time</label>
                <input
                  type="time"
                  value={newReminder.targetTime}
                  onChange={(e) => setNewReminder({ ...newReminder, targetTime: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">Alert Priority</label>
                <select
                  value={newReminder.priority}
                  onChange={(e) => setNewReminder({ ...newReminder, priority: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono"
                >
                  <option value="critical">Critical (Immediate Audio Alert)</option>
                  <option value="high">High (Yellow Flag)</option>
                  <option value="normal">Standard Operational</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-500 mb-1">Task Title</label>
              <input
                type="text"
                placeholder="e.g. Ultrasonic Spot Weld Audit on Door Frames"
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-sans"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-500 mb-1">Protocol Instructions</label>
              <input
                type="text"
                placeholder="Specific instructions for supervisor or operator..."
                value={newReminder.note}
                onChange={(e) => setNewReminder({ ...newReminder, note: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-sans"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-mono font-semibold"
            >
              Add Scheduled Reminder
            </button>
          </form>
        )}

        {/* Reminders List */}
        <div className="space-y-2">
          {reminders.map((r) => (
            <div
              key={r.id}
              className={`p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-colors ${
                r.completed
                  ? 'bg-zinc-100 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 opacity-60'
                  : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={r.completed}
                  onChange={() => handleToggleReminder(r.id)}
                  className="mt-0.5 accent-emerald-600"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                      [{r.station}] {r.title}
                    </span>
                    <span
                      className={`font-mono text-[10px] uppercase px-1.5 py-0.2 font-semibold ${
                        r.priority === 'critical' ? 'text-rose-600' : 'text-amber-600'
                      }`}
                    >
                      {r.priority}
                    </span>
                  </div>
                  {r.note && <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-0.5">{r.note}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] self-end sm:self-auto">
                <span className="flex items-center gap-1 text-zinc-500">
                  <Clock className="w-3.5 h-3.5" />
                  {r.targetTime}
                </span>
                <button
                  onClick={() => handleDeleteReminder(r.id)}
                  className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
