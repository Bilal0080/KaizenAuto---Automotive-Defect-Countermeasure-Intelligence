import React, { useState, useEffect } from 'react';
import { 
  Defect, 
  NotificationAlert, 
  UserProfile, 
  LanguageCode, 
  VehicleZone 
} from './types/index.ts';
import { storageService } from './services/storage.ts';
import { translations } from './i18n/translations.ts';

// Components
import { Header } from './components/Header.tsx';
import { OfflineSyncBanner } from './components/OfflineSyncBanner.tsx';
import { DefectList } from './components/DefectList.tsx';
import { VehicleHotspotMap } from './components/VehicleHotspotMap.tsx';
import { DefectModal } from './components/DefectModal.tsx';
import { DefectDetailModal } from './components/DefectDetailModal.tsx';
import { ReportModal } from './components/ReportModal.tsx';
import { AnalyticsDashboard } from './components/AnalyticsDashboard.tsx';
import { AndonLiveBoard } from './components/AndonLiveBoard.tsx';
import { QrScannerModal } from './components/QrScannerModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { CloudBackupModal } from './components/CloudBackupModal.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';

import { 
  ShieldAlert, 
  QrCode, 
  Activity, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Bell, 
  Zap, 
  X,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function App() {
  // Primary State
  const [defects, setDefects] = useState<Defect[]>([]);
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(storageService.getCurrentUser());
  const [availableProfiles] = useState<UserProfile[]>(storageService.getAvailableProfiles());
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedZone, setSelectedZone] = useState<VehicleZone | 'all'>('all');

  // Modals
  const [isNewDefectOpen, setIsNewDefectOpen] = useState(false);
  const [newDefectZonePreset, setNewDefectZonePreset] = useState<VehicleZone | null>(null);
  const [newDefectVinPreset, setNewDefectVinPreset] = useState<string | undefined>();
  const [newDefectPartPreset, setNewDefectPartPreset] = useState<string | undefined>();
  const [activeDefectDetail, setActiveDefectDetail] = useState<Defect | null>(null);
  const [activeDefectReport, setActiveDefectReport] = useState<Defect | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCloudBackupOpen, setIsCloudBackupOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadedDefects = storageService.getDefects();
    const loadedAlerts = storageService.getNotifications();
    setDefects(loadedDefects);
    setNotifications(loadedAlerts);
    setPendingSyncCount(storageService.getOfflineQueue().length);

    // Apply dark mode class to document element
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const t = translations[language] || translations.en;
  const unreadAlerts = notifications.filter((n) => !n.read).length;

  // Toggle Dark Mode
  const handleToggleTheme = () => {
    setIsDark(!isDark);
  };

  // Toggle Offline Mode
  const handleToggleOffline = () => {
    setIsOffline(!isOffline);
  };

  // Manual Offline Sync
  const handleManualSync = () => {
    const synced = storageService.syncOfflineQueue();
    setDefects(synced);
    setPendingSyncCount(0);
    setIsOffline(false);
  };

  // Defect Creation
  const handleCreateDefect = (defectData: Partial<Defect>) => {
    const saved = storageService.saveDefect(defectData, isOffline);
    setDefects(storageService.getDefects());
    setPendingSyncCount(storageService.getOfflineQueue().length);

    if (saved.andonTriggered) {
      const alert: NotificationAlert = {
        id: 'alt_' + Date.now(),
        title: `ANDON STOP: ${saved.station}`,
        message: `Line stop initiated for ${saved.defectCode}: ${saved.title}. Severity: ${saved.severity.toUpperCase()}.`,
        severity: 'critical',
        station: saved.station,
        defectId: saved.id,
        timestamp: new Date().toISOString(),
        read: false,
      };
      const updatedAlerts = storageService.saveNotification(alert);
      setNotifications(updatedAlerts);
    }
  };

  // Defect Update
  const handleUpdateDefect = (updated: Defect) => {
    const all = storageService.updateDefect(updated);
    setDefects(all);
    setActiveDefectDetail(updated);
  };

  // Andon Line Stop Clear
  const handleResolveAndon = (defectId: string) => {
    const target = defects.find((d) => d.id === defectId);
    if (!target) return;
    const updated = { ...target, andonTriggered: false, updatedAt: new Date().toISOString() };
    handleUpdateDefect(updated);

    const alert: NotificationAlert = {
      id: 'alt_' + Date.now(),
      title: `ANDON RESOLVED: ${target.station}`,
      message: `Line resumed by ${currentUser.name}. Station ${target.station} is active.`,
      severity: 'info',
      station: target.station,
      defectId: target.id,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const updatedAlerts = storageService.saveNotification(alert);
    setNotifications(updatedAlerts);
  };

  // Add Notification
  const handleAddNotification = (alertData: Omit<NotificationAlert, 'id' | 'timestamp' | 'read'>) => {
    const alert: NotificationAlert = {
      ...alertData,
      id: 'alt_' + Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    const updated = storageService.saveNotification(alert);
    setNotifications(updated);
  };

  // Cloud Restore
  const handleRestoreData = (restoredDefects: Defect[], restoredAlerts?: NotificationAlert[]) => {
    localStorage.setItem('kaizen_defects', JSON.stringify(restoredDefects));
    if (restoredAlerts) {
      localStorage.setItem('kaizen_notifications', JSON.stringify(restoredAlerts));
      setNotifications(restoredAlerts);
    }
    setDefects(restoredDefects);
  };

  // QR Scan Complete Handler
  const handleGlobalScanComplete = (scanned: { type: string; code: string }) => {
    if (scanned.type === 'vin') {
      setNewDefectVinPreset(scanned.code);
      setNewDefectPartPreset(undefined);
    } else {
      setNewDefectPartPreset(scanned.code);
      setNewDefectVinPreset(undefined);
    }
    setIsNewDefectOpen(true);
  };

  // Open Log for Specific Zone
  const handleQuickLogForZone = (zone: VehicleZone) => {
    setNewDefectZonePreset(zone);
    setIsNewDefectOpen(true);
  };

  const activeLineStops = defects.filter((d) => d.andonTriggered && d.status !== 'closed');

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      
      {/* Global Header */}
      <Header
        currentRole={currentUser}
        lang={language}
        onLanguageChange={setLanguage}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        unreadAlertCount={unreadAlerts}
        onOpenAlerts={() => setIsNotificationsDrawerOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenNewDefect={() => {
          setNewDefectZonePreset(null);
          setNewDefectVinPreset(undefined);
          setNewDefectPartPreset(undefined);
          setIsNewDefectOpen(true);
        }}
        onOpenCloudBackup={() => setIsCloudBackupOpen(true)}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Offline Mode Banner */}
      <OfflineSyncBanner
        isOffline={isOffline}
        pendingSyncCount={pendingSyncCount}
        onManualSync={handleManualSync}
        onToggleOffline={handleToggleOffline}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* VIEW 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Quick Action / Fast VIN Scanner Banner */}
            <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white p-5 border border-zinc-700 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 bg-amber-400 text-zinc-950 font-bold uppercase">
                    Shop Floor Fast-Track
                  </span>
                  <span className="text-xs font-mono text-zinc-300">
                    Logged in as: {currentUser.name} ({currentUser.role.toUpperCase()})
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Rapid Defect Logging & AI Countermeasure Assistant
                </h2>
                <p className="text-xs text-zinc-300 max-w-2xl">
                  Scan vehicle chassis VIN or part barcode with your device camera to instantly associate inspection data and generate IATF 16949 compliant countermeasures.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => setIsQrScannerOpen(true)}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan VIN / Barcode</span>
                </button>
                <button
                  onClick={() => {
                    setNewDefectZonePreset(null);
                    setIsNewDefectOpen(true);
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Log Incident</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div
                onClick={() => setActiveTab('defects')}
                className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 hover:border-zinc-400 cursor-pointer transition-colors"
              >
                <div className="text-[11px] font-mono text-zinc-500 uppercase">ACTIVE DEFECTS</div>
                <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                  {defects.filter((d) => d.status !== 'closed').length}
                </div>
                <div className="text-[11px] font-mono text-rose-600 mt-0.5">
                  {defects.filter((d) => d.severity === 'critical' && d.status !== 'closed').length} Critical Stops
                </div>
              </div>

              <div
                onClick={() => setActiveTab('analytics')}
                className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 hover:border-zinc-400 cursor-pointer transition-colors"
              >
                <div className="text-[11px] font-mono text-zinc-500 uppercase">FIRST TIME QUALITY (FTQ)</div>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  96.8%
                </div>
                <div className="text-[11px] font-mono text-emerald-600 mt-0.5">Target: &gt; 95.0%</div>
              </div>

              <div
                onClick={() => setActiveTab('andon')}
                className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 hover:border-zinc-400 cursor-pointer transition-colors"
              >
                <div className="text-[11px] font-mono text-zinc-500 uppercase">LINE ANDON BEACON</div>
                <div className={`text-2xl font-bold font-mono mt-1 ${activeLineStops.length > 0 ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}`}>
                  {activeLineStops.length > 0 ? `${activeLineStops.length} STOPS` : 'ALL RUNNING'}
                </div>
                <div className="text-[11px] font-mono text-zinc-500 mt-0.5">Takt Time: 58 sec</div>
              </div>

              <div
                onClick={() => setActiveTab('analytics')}
                className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 hover:border-zinc-400 cursor-pointer transition-colors"
              >
                <div className="text-[11px] font-mono text-zinc-500 uppercase">5-WHY COMPLETION</div>
                <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                  {defects.filter((d) => d.fiveWhy?.completed).length} / {defects.length}
                </div>
                <div className="text-[11px] font-mono text-blue-500 mt-0.5">IATF 16949 Audited</div>
              </div>
            </div>

            {/* Vehicle CAD Hotspots Overview */}
            <VehicleHotspotMap
              defects={defects}
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
              onQuickLogForZone={handleQuickLogForZone}
            />

            {/* Recent Open Defects Strip */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  Recent Line Issues Requiring Triage
                </h3>
                <button
                  onClick={() => setActiveTab('defects')}
                  className="text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>View All ({defects.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {defects.slice(0, 4).map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setActiveDefectDetail(d)}
                    className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold">{d.defectCode}</span>
                        <span
                          className={`font-mono text-[10px] uppercase font-bold px-1.5 py-0.2 ${
                            d.severity === 'critical' ? 'text-rose-600' : 'text-amber-600'
                          }`}
                        >
                          {d.severity}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">[{d.station}]</span>
                      </div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{d.title}</div>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs text-zinc-500">
                      <span>VIN: {d.vinOrUnitId}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDefectReport(d);
                        }}
                        className="px-2 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] hover:bg-zinc-300"
                      >
                        8D Doc
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: Defects List / Workbench */}
        {activeTab === 'defects' && (
          <DefectList
            defects={defects}
            currentUserRole={currentUser.role}
            onSelectDefect={(d) => setActiveDefectDetail(d)}
            onOpenReport={(d) => setActiveDefectReport(d)}
            onAddNewDefect={() => {
              setNewDefectZonePreset(null);
              setIsNewDefectOpen(true);
            }}
          />
        )}

        {/* VIEW 3: Vehicle Hotspot Map */}
        {activeTab === 'hotspots' && (
          <div className="space-y-6">
            <VehicleHotspotMap
              defects={defects}
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
              onQuickLogForZone={handleQuickLogForZone}
            />

            {/* Filtered defects in selected zone */}
            {selectedZone !== 'all' && (
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold uppercase text-zinc-500">
                  Defects currently filtered for zone: [{selectedZone}]
                </div>
                <DefectList
                  defects={defects.filter((d) => d.vehicleZone === selectedZone)}
                  currentUserRole={currentUser.role}
                  onSelectDefect={(d) => setActiveDefectDetail(d)}
                  onOpenReport={(d) => setActiveDefectReport(d)}
                  onAddNewDefect={() => handleQuickLogForZone(selectedZone)}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: Andon Board */}
        {activeTab === 'andon' && (
          <AndonLiveBoard
            defects={defects}
            notifications={notifications}
            onResolveAndon={handleResolveAndon}
            onAddNotification={handleAddNotification}
          />
        )}

        {/* VIEW 5: Quality Analytics */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard defects={defects} />
        )}

      </main>

      {/* Notifications Drawer */}
      {isNotificationsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-300 dark:border-zinc-800 h-full flex flex-col p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-zinc-900 dark:text-zinc-100">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>Line Alerts & Supervisor Dispatch ({notifications.length})</span>
              </div>
              <button
                onClick={() => setIsNotificationsDrawerOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {notifications.length === 0 ? (
                <p className="text-xs text-zinc-400 font-mono text-center py-12">
                  No alerts logged. Factory line operating smoothly.
                </p>
              ) : (
                notifications.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 border text-xs space-y-1 ${
                      alert.severity === 'critical'
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900'
                        : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{alert.title}</span>
                      <span className="text-zinc-400">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300">{alert.message}</p>
                    <div className="text-[10px] font-mono text-zinc-500 pt-1">
                      Station: {alert.station}
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => {
                const cleared = storageService.clearNotifications();
                setNotifications(cleared);
              }}
              className="w-full py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-300 text-xs font-mono font-semibold uppercase"
            >
              Clear All Alerts
            </button>
          </div>
        </div>
      )}

      {/* Global QR / Barcode Scanner Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        defaultMode="vin"
        onScanComplete={handleGlobalScanComplete}
      />

      {/* Defect Create Modal */}
      <DefectModal
        isOpen={isNewDefectOpen}
        onClose={() => setIsNewDefectOpen(false)}
        onSubmit={handleCreateDefect}
        currentUser={currentUser}
        initialZone={newDefectZonePreset}
        initialVin={newDefectVinPreset}
        initialPart={newDefectPartPreset}
      />

      {/* Defect Detail & 8D Workbench Modal */}
      {activeDefectDetail && (
        <DefectDetailModal
          defect={activeDefectDetail}
          currentUserRole={currentUser.role}
          currentUserName={currentUser.name}
          onClose={() => setActiveDefectDetail(null)}
          onUpdateDefect={handleUpdateDefect}
          onOpen8DReport={(d) => setActiveDefectReport(d)}
        />
      )}

      {/* 8D Report Dossier Modal */}
      {activeDefectReport && (
        <ReportModal
          defect={activeDefectReport}
          onClose={() => setActiveDefectReport(null)}
        />
      )}

      {/* RBAC Auth & Biometric Modal */}
      {isAuthOpen && (
        <AuthModal
          currentUser={currentUser}
          availableProfiles={availableProfiles}
          onSelectUser={(u) => {
            setCurrentUser(u);
            storageService.setCurrentUser(u);
          }}
          onClose={() => setIsAuthOpen(false)}
        />
      )}

      {/* Cloud Backup & Restore Modal */}
      {isCloudBackupOpen && (
        <CloudBackupModal
          defects={defects}
          notifications={notifications}
          onRestoreData={handleRestoreData}
          onClose={() => setIsCloudBackupOpen(false)}
        />
      )}

      {/* Shop Floor Onboarding Guide Modal */}
      {isOnboardingOpen && (
        <OnboardingModal
          onClose={() => setIsOnboardingOpen(false)}
          onOpenScanner={() => setIsQrScannerOpen(true)}
        />
      )}

    </div>
  );
}
