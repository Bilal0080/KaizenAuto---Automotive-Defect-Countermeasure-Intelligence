import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

interface OfflineSyncBannerProps {
  isOffline: boolean;
  pendingSyncCount: number;
  onManualSync: () => void;
  onToggleOffline: () => void;
}

export const OfflineSyncBanner: React.FC<OfflineSyncBannerProps> = ({
  isOffline,
  pendingSyncCount,
  onManualSync,
  onToggleOffline,
}) => {
  if (!isOffline && pendingSyncCount === 0) return null;

  return (
    <div
      className={`px-4 py-2 text-xs font-mono border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
        isOffline
          ? 'bg-amber-500 text-zinc-950 border-amber-600 font-medium'
          : 'bg-emerald-600 text-white border-emerald-700'
      }`}
    >
      <div className="flex items-center gap-2">
        {isOffline ? <WifiOff className="w-4 h-4 shrink-0" /> : <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />}
        <span>
          {isOffline
            ? `OFFLINE SHOP FLOOR MODE ACTIVE — ${pendingSyncCount} defect(s) queued in local storage.`
            : `NETWORK RESTORED — ${pendingSyncCount} item(s) ready to sync to central plant database.`}
        </span>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          onClick={onManualSync}
          disabled={pendingSyncCount === 0}
          className="px-2.5 py-1 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-mono font-bold uppercase disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          Sync Now ({pendingSyncCount})
        </button>

        <button
          onClick={onToggleOffline}
          className="px-2.5 py-1 border border-zinc-950/40 text-xs font-mono underline hover:no-underline"
        >
          {isOffline ? 'Go Online' : 'Simulate Offline'}
        </button>
      </div>
    </div>
  );
};
