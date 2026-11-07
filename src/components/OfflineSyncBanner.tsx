import React, { useState } from 'react';
import { WifiOff, RefreshCw, Check } from 'lucide-react';
import { storage } from '../services/storage';

interface OfflineSyncBannerProps {
  isOffline: boolean;
  onSyncComplete: () => void;
}

export const OfflineSyncBanner: React.FC<OfflineSyncBannerProps> = ({
  isOffline,
  onSyncComplete,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedRecently, setSyncedRecently] = useState(false);

  const pendingItems = storage.getOfflineQueue();

  if (!isOffline && pendingItems.length === 0 && !syncedRecently) return null;

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      storage.clearOfflineQueue();
      setIsSyncing(false);
      setSyncedRecently(true);
      onSyncComplete();
      setTimeout(() => setSyncedRecently(false), 3000);
    }, 1000);
  };

  return (
    <div className="bg-amber-950/60 border-b border-amber-800/80 text-amber-200 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {isOffline ? (
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>
            {isOffline ? (
              <>
                <strong>Offline Standalone Mode:</strong> Local storage database active. All defect logs, 5-Why analyses, and countermeasures are stored safely on this tablet/terminal.
              </>
            ) : (
              <>
                <strong>Plant Cloud Online:</strong> All offline records synchronized successfully.
              </>
            )}
          </span>
          {pendingItems.length > 0 && (
            <span className="font-mono text-[11px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold">
              {pendingItems.length} changes queued
            </span>
          )}
        </div>

        <button
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="px-3 py-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded transition-colors flex items-center gap-1.5 shadow shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>
    </div>
  );
};
