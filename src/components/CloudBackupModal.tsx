import React, { useState } from 'react';
import { storage } from '../services/storage';
import { Defect } from '../types';
import { 
  X, 
  CloudUpload, 
  Download, 
  UploadCloud, 
  RotateCcw, 
  Check, 
  Database,
  ShieldCheck
} from 'lucide-react';

interface CloudBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: (defects: Defect[]) => void;
}

export const CloudBackupModal: React.FC<CloudBackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [backupMeta, setBackupMeta] = useState(storage.getBackupMeta());
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTriggerCloudBackup = () => {
    setIsBackingUp(true);
    setStatusMessage(null);
    setTimeout(() => {
      const res = storage.triggerCloudBackup();
      setBackupMeta(storage.getBackupMeta());
      setIsBackingUp(false);
      setStatusMessage(`Successfully backed up ${res.totalRecords} quality records to Plant Cloud.`);
    }, 1200);
  };

  const handleDownloadBackup = () => {
    const json = storage.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kaizenauto_cloud_snapshot_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setStatusMessage('Snapshot downloaded to local workstation.');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storage.restoreBackupJson(content);
      if (success) {
        const fresh = storage.getDefects();
        onDataRestored(fresh);
        setStatusMessage('Cloud backup restored successfully!');
      } else {
        setStatusMessage('Error: Invalid backup JSON structure.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (confirm('Reset defect registry to clean initial automotive demo state?')) {
      const fresh = storage.resetDemoData();
      onDataRestored(fresh);
      setStatusMessage('Demo data restored to factory initial state.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudUpload className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Cloud Backup & Data Synchronization</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Banner */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Cloud Storage Sync State:</span>
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Synchronized
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last Snapshot Timestamp:</span>
              <span className="font-mono text-slate-200">
                {new Date(backupMeta.lastBackup).toLocaleString()}
              </span>
            </div>
          </div>

          {statusMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs">
              {statusMessage}
            </div>
          )}

          {/* Action 1: Synchronize Now */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Plant Cloud Backup
            </h4>
            <button
              onClick={handleTriggerCloudBackup}
              disabled={isBackingUp}
              className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow flex items-center justify-center gap-2"
            >
              <CloudUpload className={`w-4 h-4 ${isBackingUp ? 'animate-bounce' : ''}`} />
              <span>{isBackingUp ? 'Pushing Snapshot to Plant Cloud...' : 'Create Cloud Snapshot Now'}</span>
            </button>
          </div>

          {/* Action 2: Export & Import JSON */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Cross-Device Backup File (JSON)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadBackup}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export JSON File</span>
              </button>

              <label className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                <span>Restore JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Action 3: Reset Demo Data */}
          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleResetDemo}
              className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Factory Sample Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
