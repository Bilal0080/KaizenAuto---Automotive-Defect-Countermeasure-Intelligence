import React, { useState } from 'react';
import { Defect, NotificationAlert, UserProfile } from '../types';
import { 
  AlertOctagon, 
  Volume2, 
  VolumeX, 
  Bell, 
  CheckCircle, 
  Clock, 
  Send, 
  Users, 
  Radio
} from 'lucide-react';

interface AndonLiveBoardProps {
  defects: Defect[];
  alerts: NotificationAlert[];
  currentUser: UserProfile;
  onAcknowledgeAlert: (alertId: string) => void;
  onSelectDefect: (defect: Defect) => void;
  onAddScheduledReminder: (title: string, station: string, timeMinutes: number) => void;
}

export const AndonLiveBoard: React.FC<AndonLiveBoardProps> = ({
  defects,
  alerts,
  currentUser,
  onAcknowledgeAlert,
  onSelectDefect,
  onAddScheduledReminder,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderStation, setReminderStation] = useState('Station 14: Subframe Bolting');
  const [reminderMinutes, setReminderMinutes] = useState(30);

  const criticalAndonDefects = defects.filter((d) => d.andonTriggered && d.status !== 'closed');
  const isLineStopped = criticalAndonDefects.length > 0;

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim()) return;
    onAddScheduledReminder(reminderTitle, reminderStation, reminderMinutes);
    setReminderTitle('');
  };

  return (
    <div className="space-y-6">
      {/* High-Impact Andon Line Status Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isLineStopped
            ? 'bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 border-red-500/80 shadow-2xl shadow-red-900/30'
            : 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/40'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${
                isLineStopped
                  ? 'bg-red-600 animate-pulse shadow-red-600/50'
                  : 'bg-emerald-600 shadow-emerald-600/30'
              }`}
            >
              {isLineStopped ? (
                <AlertOctagon className="w-8 h-8" />
              ) : (
                <CheckCircle className="w-8 h-8" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
                  Main Vehicle Assembly Line 1 & 2
                </span>
                <span className="text-slate-600">·</span>
                <Radio className={`w-3.5 h-3.5 ${isLineStopped ? 'text-red-500' : 'text-emerald-400'}`} />
                <span className="text-xs font-mono font-bold text-slate-300">LIVE ANDON</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                {isLineStopped
                  ? 'PRODUCTION LINE STOPPING / ANDON TRIGGERED'
                  : 'ASSEMBLY LINE RUNNING NOMINAL'}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {isLineStopped
                  ? `${criticalAndonDefects.length} Station(s) requesting immediate supervisor & engineering response.`
                  : 'Zero critical line stoppages. Takt time pace: 58 seconds/vehicle.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                audioEnabled
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Toggle shop floor Andon buzzer simulation"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{audioEnabled ? 'Buzzer Chime Armed' : 'Mute Buzzer'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Andon Pulls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-500" />
              <span>Active Andon Pulls & Urgent Station Dispatches</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {criticalAndonDefects.length} Escalations
            </span>
          </div>

          {criticalAndonDefects.length === 0 ? (
            <div className="p-10 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-200">All Stations Operating Clear</p>
              <p className="text-xs text-slate-500 mt-1">
                No active Andon cords pulled. When a worker pulls the Andon cord, it flashes here with instant supervisor paging.
              </p>
            </div>
          ) : (
            criticalAndonDefects.map((d) => (
              <div
                key={d.id}
                className="p-5 bg-slate-900 border-2 border-red-500/60 rounded-xl shadow-lg shadow-red-950/20 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-600 text-white font-mono text-xs font-bold rounded">
                      LINE STOP
                    </span>
                    <h4 className="text-sm font-bold text-white">{d.station}</h4>
                  </div>
                  <span className="font-mono text-xs text-amber-400">{d.vinOrUnitId}</span>
                </div>

                <p className="text-xs text-slate-200 font-medium">{d.title}</p>
                <p className="text-xs text-slate-400">{d.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">
                    Reported by: <strong className="text-slate-200 font-normal">{d.reportedBy}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectDefect(d)}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg transition-colors text-xs"
                    >
                      Open 8D Triage & Countermeasures
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Plant Notification Feed */}
          <div className="pt-4 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Plant Shift Alert & Notification Stream</span>
            </h3>

            <div className="space-y-2">
              {alerts.map((alt) => (
                <div
                  key={alt.id}
                  className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                    alt.read
                      ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                      : 'bg-slate-900 border-slate-700 text-slate-200 shadow-sm'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          alt.severity === 'critical'
                            ? 'bg-red-500'
                            : alt.severity === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-cyan-400'
                        }`}
                      />
                      <span className="font-bold text-white">{alt.title}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-[11px] font-mono text-slate-400">{alt.station}</span>
                    </div>
                    <p className="text-slate-300">{alt.message}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(alt.timestamp).toLocaleTimeString()}
                      {alt.acknowledgedBy && ` · Acknowledged by ${alt.acknowledgedBy}`}
                    </div>
                  </div>

                  {!alt.read && (
                    <button
                      onClick={() => onAcknowledgeAlert(alt.id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs whitespace-nowrap transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule Task Reminder Sidebar */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 h-fit">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Schedule Quality Inspection Reminder</h3>
          </div>
          <p className="text-xs text-slate-400">
            Set custom timed push alerts for torque audits, bath chemical checks, or shift handover checks.
          </p>

          <form onSubmit={handleCreateReminder} className="space-y-3">
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">Reminder Task</label>
              <input
                type="text"
                required
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                placeholder="e.g. 100% torque audit on chassis batch #4"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">Target Station</label>
              <input
                type="text"
                value={reminderStation}
                onChange={(e) => setReminderStation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">Alert Trigger Time</label>
              <select
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                <option value={15}>In 15 Minutes</option>
                <option value={30}>In 30 Minutes</option>
                <option value={60}>In 1 Hour</option>
                <option value={120}>In 2 Hours (Next Shift)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Schedule Alert Reminder</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
