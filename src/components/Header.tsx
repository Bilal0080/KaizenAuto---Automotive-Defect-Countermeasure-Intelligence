import React from 'react';
import { 
  ShieldAlert, 
  Wifi, 
  WifiOff, 
  Sun, 
  Moon, 
  Languages, 
  UserCheck, 
  HelpCircle, 
  PlusCircle,
  Bell,
  CloudUpload,
  QrCode
} from 'lucide-react';
import { LanguageCode, UserProfile } from '../types';
import { translations } from '../i18n/translations';

interface HeaderProps {
  currentRole: UserProfile;
  lang: LanguageCode;
  onLanguageChange: (code: LanguageCode) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  unreadAlertCount: number;
  onOpenAlerts: () => void;
  onOpenAuth: () => void;
  onOpenOnboarding: () => void;
  onOpenNewDefect: () => void;
  onOpenCloudBackup: () => void;
  onOpenQrScanner: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  lang,
  onLanguageChange,
  isDark,
  onToggleTheme,
  isOffline,
  onToggleOffline,
  unreadAlertCount,
  onOpenAlerts,
  onOpenAuth,
  onOpenOnboarding,
  onOpenNewDefect,
  onOpenCloudBackup,
  onOpenQrScanner,
  activeTab,
  onTabChange,
}) => {
  const t = translations[lang] || translations.en;

  const roleBadgeColors: Record<string, string> = {
    worker: 'text-amber-500 dark:text-amber-400',
    inspector: 'text-cyan-500 dark:text-cyan-400',
    supervisor: 'text-emerald-500 dark:text-emerald-400',
    manager: 'text-purple-500 dark:text-purple-400',
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Primary Top Bar adhering to Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => onTabChange('dashboard')}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
              {t.appName}
            </span>
            <span className="text-[10px] tracking-wide text-slate-400 uppercase -mt-0.5 hidden sm:inline">
              Automotive Kaizen IQ
            </span>
          </div>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`whitespace-nowrap transition-colors pb-0.5 ${
              activeTab === 'dashboard'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            {t.dashboard}
          </button>
          <button
            onClick={() => onTabChange('defects')}
            className={`whitespace-nowrap transition-colors pb-0.5 ${
              activeTab === 'defects'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            {t.defects}
          </button>
          <button
            onClick={() => onTabChange('hotspots')}
            className={`whitespace-nowrap transition-colors pb-0.5 ${
              activeTab === 'hotspots'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            {t.hotspots}
          </button>
          <button
            onClick={() => onTabChange('andon')}
            className={`whitespace-nowrap transition-colors pb-0.5 flex items-center gap-1.5 ${
              activeTab === 'andon'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            {t.andon}
            {unreadAlertCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 bg-red-600 text-white rounded font-mono font-bold">
                {unreadAlertCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`whitespace-nowrap transition-colors pb-0.5 ${
              activeTab === 'analytics'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            {t.analytics}
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNewDefect}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all rounded-lg shadow-sm whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.newDefect}</span>
          </button>
        </div>
      </div>

      {/* Industrial Utility Sub-bar */}
      <div className="bg-slate-900/60 dark:bg-slate-950/60 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto">
          {/* User & Station Info */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-800/70 hover:bg-slate-800 text-slate-200 transition-colors text-xs"
              title="Click to switch worker role or authenticate"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium">{currentRole.name}</span>
              <span className="text-slate-500">·</span>
              <span className={`font-mono text-[11px] ${roleBadgeColors[currentRole.role] || 'text-slate-400'}`}>
                {currentRole.badgeId}
              </span>
            </button>
            <span className="text-slate-500 hidden md:inline">|</span>
            <span className="text-slate-400 hidden md:inline truncate max-w-xs">
              {currentRole.station}
            </span>
          </div>

          {/* Plant Tools: Network, QR Scan, Alerts, Language, Theme, Help */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick QR & Barcode Scanner */}
            <button
              onClick={onOpenQrScanner}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-slate-700/60 text-xs font-semibold transition-colors"
              title="Quick Scan Vehicle VIN or Part QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scan Barcode / QR</span>
            </button>

            {/* Offline Simulator Switch */}
            <button
              onClick={onToggleOffline}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
                isOffline
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-emerald-400'
              }`}
              title={isOffline ? 'Offline mode active. Click to reconnect.' : 'Connected. Click to test offline mode.'}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isOffline ? 'Offline Mode' : 'Plant Cloud'}</span>
            </button>

            {/* Cloud Backup */}
            <button
              onClick={onOpenCloudBackup}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
              title={t.cloudBackup}
            >
              <CloudUpload className="w-4 h-4" />
            </button>

            {/* Alerts Feed */}
            <button
              onClick={onOpenAlerts}
              className="relative p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
              title="Andon & Notification Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center">
              <Languages className="w-3.5 h-3.5 text-slate-400 mr-1" />
              <select
                value={lang}
                onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                className="bg-slate-800/80 text-slate-200 text-xs rounded px-2 py-1 border border-slate-700/60 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="en">English (US)</option>
                <option value="ur_roman">Roman Urdu (ورکر اردو)</option>
                <option value="ur">اردو (Urdu)</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語 (TPS)</option>
                <option value="es">Español</option>
              </select>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
              title="Toggle Light / Dark Mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Onboarding Help */}
            <button
              onClick={onOpenOnboarding}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
              title="Shop Floor Worker Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Tabs */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-900 px-2 py-1 text-xs">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`py-1.5 px-2 rounded ${activeTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
        >
          {t.dashboard}
        </button>
        <button
          onClick={() => onTabChange('defects')}
          className={`py-1.5 px-2 rounded ${activeTab === 'defects' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
        >
          {t.defects}
        </button>
        <button
          onClick={() => onTabChange('hotspots')}
          className={`py-1.5 px-2 rounded ${activeTab === 'hotspots' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
        >
          {t.hotspots}
        </button>
        <button
          onClick={() => onTabChange('andon')}
          className={`py-1.5 px-2 rounded flex items-center gap-1 ${activeTab === 'andon' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
        >
          {t.andon}
          {unreadAlertCount > 0 && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
        </button>
        <button
          onClick={() => onTabChange('analytics')}
          className={`py-1.5 px-2 rounded ${activeTab === 'analytics' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
        >
          {t.analytics}
        </button>
      </div>
    </header>
  );
};
