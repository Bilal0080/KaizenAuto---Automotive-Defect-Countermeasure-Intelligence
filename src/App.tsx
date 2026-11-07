import React, { useState, useEffect } from 'react';
import { Defect, LanguageCode, NotificationAlert, UserProfile, VehicleZone } from './types';
import { storage } from './services/storage';
import { translations } from './i18n/translations';
import { Header } from './components/Header';
import { DefectList } from './components/DefectList';
import { DefectModal } from './components/DefectModal';
import { DefectDetailModal } from './components/DefectDetailModal';
import { VehicleHotspotMap } from './components/VehicleHotspotMap';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AndonLiveBoard } from './components/AndonLiveBoard';
import { ReportModal } from './components/ReportModal';
import { AuthModal } from './components/AuthModal';
import { CloudBackupModal } from './components/CloudBackupModal';
import { OnboardingModal } from './components/OnboardingModal';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';
import { 
  ShieldAlert, 
  Wrench, 
  Sparkles, 
  AlertOctagon, 
  CheckCircle, 
  Crosshair, 
  Layers,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [defects, setDefects] = useState<Defect[]>(() => storage.getDefects());
  const [alerts, setAlerts] = useState<NotificationAlert[]>(() => storage.getAlerts());
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storage.getCurrentUser());
  const [lang, setLang] = useState<LanguageCode>('en');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedZone, setSelectedZone] = useState<VehicleZone | null>(null);

  // Modals state
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);
  const [reportDefect, setReportDefect] = useState<Defect | null>(null);
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCloudBackupOpen, setIsCloudBackupOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const t = translations[lang] || translations.en;

  // Toggle theme class on document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Handle Add Defect
  const handleAddDefect = (defectData: Partial<Defect>) => {
    const newDefect: Defect = {
      id: `def-${Date.now()}`,
      defectCode: defectData.defectCode || `DEF-${Date.now().toString().slice(-4)}`,
      title: defectData.title || 'Untitled Defect',
      description: defectData.description || '',
      category: defectData.category || 'Torque & Fastener',
      severity: defectData.severity || 'major',
      status: 'open',
      line: defectData.line || 'Main Assembly',
      station: defectData.station || currentUser.station,
      vehicleZone: defectData.vehicleZone || 'underbody_battery',
      vinOrUnitId: defectData.vinOrUnitId || `VIN-WAUZZZ-${Math.floor(10000 + Math.random() * 90000)}`,
      partNumber: defectData.partNumber,
      reportedBy: defectData.reportedBy || currentUser.name,
      reportedByBadge: defectData.reportedByBadge || currentUser.badgeId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: defectData.imageUrl,
      andonTriggered: defectData.andonTriggered || false,
      countermeasures: defectData.countermeasures || [],
      comments: defectData.comments || [],
    };

    const updated = storage.addDefect(newDefect, isOffline);
    setDefects(updated);
    setAlerts(storage.getAlerts());

    // Switch to detail view immediately to allow 5-Why and countermeasures
    setSelectedDefect(newDefect);
  };

  // Handle Update Defect
  const handleUpdateDefect = (updated: Defect) => {
    const list = storage.updateDefect(updated, isOffline);
    setDefects(list);
    setSelectedDefect(updated);
  };

  // Handle Delete Defect
  const handleDeleteDefect = (id: string) => {
    const updated = storage.deleteDefect(id);
    setDefects(updated);
    if (selectedDefect?.id === id) {
      setSelectedDefect(null);
    }
  };

  // Acknowledge Alert
  const handleAcknowledgeAlert = (alertId: string) => {
    const updated = storage.markAlertAsRead(alertId, currentUser.name);
    setAlerts(updated);
  };

  // Scheduled Reminder
  const handleAddScheduledReminder = (title: string, station: string, timeMinutes: number) => {
    const newAlert: NotificationAlert = {
      id: `alt-${Date.now()}`,
      title: `Scheduled Quality Check: ${title}`,
      message: `Due at ${station} in ${timeMinutes} minutes. Assigned to shift team.`,
      severity: 'warning',
      timestamp: new Date().toISOString(),
      station,
      read: false,
    };
    const updated = storage.addAlert(newAlert);
    setAlerts(updated);
  };

  const unreadAlertCount = alerts.filter((a) => !a.read).length;
  const criticalCount = defects.filter((d) => d.severity === 'critical' && d.status !== 'closed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <Header
        currentRole={currentUser}
        lang={lang}
        onLanguageChange={setLang}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        isOffline={isOffline}
        onToggleOffline={() => setIsOffline(!isOffline)}
        unreadAlertCount={unreadAlertCount}
        onOpenAlerts={() => setActiveTab('andon')}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenNewDefect={() => setIsDefectModalOpen(true)}
        onOpenCloudBackup={() => setIsCloudBackupOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Offline Status & Pending Sync Indicator */}
      <OfflineSyncBanner
        isOffline={isOffline}
        onSyncComplete={() => {
          setDefects(storage.getDefects());
          setAlerts(storage.getAlerts());
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* DASHBOARD TAB (Default View) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Industrial Plant Hero Spotlight */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
              <div className="absolute inset-0">
                <img
                  src="/src/assets/images/automotive_assembly_plant_1794069669601.jpg"
                  alt="Automotive Manufacturing Assembly Line"
                  className="w-full h-full object-cover opacity-25 filter brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
              </div>

              <div className="relative p-6 sm:p-8 max-w-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Kaizen Quality Intelligence · Plant 01</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Automotive Defect Analysis & Countermeasures
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Log line defects in seconds, trigger digital Andon cord alerts, run 5-Why root cause investigations, and execute permanent countermeasures to protect production efficiency.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsDefectModalOpen(true)}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow"
                  >
                    <span>{t.newDefect}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab('hotspots')}
                    className="px-4 py-2 bg-slate-800/90 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-2 border border-slate-700"
                  >
                    <Crosshair className="w-4 h-4 text-cyan-400" />
                    <span>Inspect Vehicle Wireframe</span>
                  </button>

                  <button
                    onClick={() => setIsOnboardingOpen(true)}
                    className="px-3.5 py-2 text-slate-300 hover:text-white text-xs underline font-medium"
                  >
                    Worker Guide / Tutorial
                  </button>
                </div>
              </div>

              {/* Quick Status Bar below hero */}
              <div className="relative border-t border-slate-800/80 bg-slate-950/80 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">CURRENT SHIFT</span>
                  <span className="text-white font-bold">Shift A (06:00 - 14:00)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">FIRST TIME QUALITY</span>
                  <span className="text-emerald-400 font-bold tabular-nums">96.8% FTQ</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CRITICAL LINE STOPS</span>
                  <span className={`font-bold tabular-nums ${criticalCount > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                    {criticalCount} Active
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">IATF COMPLIANCE</span>
                  <span className="text-cyan-400 font-bold">8D Methodology</span>
                </div>
              </div>
            </div>

            {/* Interactive Vehicle Wireframe */}
            <VehicleHotspotMap
              defects={defects}
              selectedZone={selectedZone}
              onSelectZone={(zone) => {
                setSelectedZone(zone);
                if (zone) setActiveTab('defects');
              }}
              onLogDefectForZone={(zone) => {
                setSelectedZone(zone);
                setIsDefectModalOpen(true);
              }}
            />

            {/* Recent Defects List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Active Shop Floor Defect Logs</h3>
                  <p className="text-xs text-slate-400">
                    Latest issues reported by line workers and inspectors undergoing 5-Why analysis.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('defects')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <span>View All Registry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <DefectList
                defects={defects.slice(0, 5)}
                onSelectDefect={(d) => setSelectedDefect(d)}
                onDeleteDefect={handleDeleteDefect}
                filterZone={selectedZone}
                onClearZoneFilter={() => setSelectedZone(null)}
              />
            </div>
          </div>
        )}

        {/* DEFECTS REGISTRY TAB */}
        {activeTab === 'defects' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-white">Automotive Defect Registry</h2>
                <p className="text-xs text-slate-400">
                  Comprehensive log of all vehicle defects, torque anomalies, paint inclusions, and electrical issues.
                </p>
              </div>
              <button
                onClick={() => setIsDefectModalOpen(true)}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 self-start shadow"
              >
                <span>{t.newDefect}</span>
              </button>
            </div>

            <DefectList
              defects={defects}
              onSelectDefect={(d) => setSelectedDefect(d)}
              onDeleteDefect={handleDeleteDefect}
              filterZone={selectedZone}
              onClearZoneFilter={() => setSelectedZone(null)}
            />
          </div>
        )}

        {/* HOTSPOTS CAR BLUEPRINT TAB */}
        {activeTab === 'hotspots' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Interactive Vehicle Wireframe</h2>
              <p className="text-xs text-slate-400">
                Click any zone on the vehicle chassis and body diagram to isolate reported defects or log an in-station variance.
              </p>
            </div>

            <VehicleHotspotMap
              defects={defects}
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
              onLogDefectForZone={(zone) => {
                setSelectedZone(zone);
                setIsDefectModalOpen(true);
              }}
            />

            {selectedZone && (
              <div className="pt-4">
                <DefectList
                  defects={defects}
                  onSelectDefect={(d) => setSelectedDefect(d)}
                  onDeleteDefect={handleDeleteDefect}
                  filterZone={selectedZone}
                  onClearZoneFilter={() => setSelectedZone(null)}
                />
              </div>
            )}
          </div>
        )}

        {/* ANDON LIVE BOARD TAB */}
        {activeTab === 'andon' && (
          <AndonLiveBoard
            defects={defects}
            alerts={alerts}
            currentUser={currentUser}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onSelectDefect={(d) => setSelectedDefect(d)}
            onAddScheduledReminder={handleAddScheduledReminder}
          />
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard defects={defects} />
        )}
      </main>

      {/* Modal 1: Defect Logging */}
      <DefectModal
        isOpen={isDefectModalOpen}
        onClose={() => setIsDefectModalOpen(false)}
        onSubmit={handleAddDefect}
        currentUser={currentUser}
        initialZone={selectedZone}
      />

      {/* Modal 2: 8D Defect Deep Dive & Countermeasures */}
      {selectedDefect && (
        <DefectDetailModal
          defect={selectedDefect}
          isOpen={Boolean(selectedDefect)}
          onClose={() => setSelectedDefect(null)}
          onUpdateDefect={handleUpdateDefect}
          currentUser={currentUser}
          isOffline={isOffline}
          onOpenReport={(d) => {
            setReportDefect(d);
            setIsReportModalOpen(true);
          }}
        />
      )}

      {/* Modal 3: Printable 8D Quality Report */}
      <ReportModal
        defect={reportDefect || selectedDefect}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        allDefects={defects}
      />

      {/* Modal 4: RBAC & Biometric Authentication */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={(usr) => {
          setCurrentUser(usr);
          storage.setCurrentUser(usr);
        }}
      />

      {/* Modal 5: Cloud Backup & Snapshot */}
      <CloudBackupModal
        isOpen={isCloudBackupOpen}
        onClose={() => setIsCloudBackupOpen(false)}
        onDataRestored={(fresh) => {
          setDefects(fresh);
          setAlerts(storage.getAlerts());
        }}
      />

      {/* Modal 6: Worker Onboarding Tutorial */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onStartDefect={() => setIsDefectModalOpen(true)}
      />

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-900 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">KaizenAuto IQ</span>
            <span>·</span>
            <span>Automotive Quality & Countermeasure Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>IATF 16949 & 8D Certified</span>
            <span>·</span>
            <span>Offline Local Cache Active</span>
            <span>·</span>
            <span>Plant Cloud Connected</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
