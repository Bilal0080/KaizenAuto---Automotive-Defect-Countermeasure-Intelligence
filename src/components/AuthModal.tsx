import React, { useState } from 'react';
import { UserRole, UserProfile } from '../types/index.ts';
import { X, Fingerprint, Shield, KeyRound, Check, Smartphone } from 'lucide-react';

interface AuthModalProps {
  currentUser: UserProfile;
  availableProfiles: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  availableProfiles,
  onSelectUser,
  onClose,
}) => {
  const [pin, setPin] = useState('');
  const [isScanningBiometric, setIsScanningBiometric] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);

  const handleSimulateBiometric = () => {
    setIsScanningBiometric(true);
    setTimeout(() => {
      setIsScanningBiometric(false);
      setBiometricSuccess(true);
      setTimeout(() => {
        const matching = availableProfiles.find((p) => p.role === selectedRole) || availableProfiles[0];
        onSelectUser(matching);
        onClose();
      }, 700);
    }, 1200);
  };

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    const matching = availableProfiles.find((p) => p.role === role);
    if (matching) {
      onSelectUser(matching);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 w-full max-w-md p-6 shadow-2xl space-y-6 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Plant Security & Role-Based Access
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active User Profile Card */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-zinc-500 uppercase">Authenticated Operator</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{currentUser.name}</div>
            <div className="text-xs font-mono text-zinc-500">Badge: {currentUser.badgeId} • {currentUser.station}</div>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold uppercase">
            {currentUser.role}
          </span>
        </div>

        {/* Role Selector Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase font-semibold text-zinc-500">
            Switch Operating Clearance / Profile:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectRole(p.role)}
                className={`p-3 text-left border transition-all ${
                  currentUser.role === p.role
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase text-zinc-900 dark:text-zinc-100">
                    {p.role}
                  </span>
                  {currentUser.role === p.role && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">{p.name}</div>
                <div className="text-[10px] font-mono text-zinc-400">{p.badgeId}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Biometric Sensor Simulation */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
          <button
            onClick={handleSimulateBiometric}
            disabled={isScanningBiometric}
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2 transition-all ${
              isScanningBiometric
                ? 'border-emerald-500 bg-emerald-500/20 animate-pulse'
                : biometricSuccess
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 text-zinc-500 hover:text-emerald-500'
            }`}
          >
            <Fingerprint className="w-8 h-8" />
          </button>

          <div>
            <div className="text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200">
              {isScanningBiometric ? 'Verifying Shop Floor Biometric...' : biometricSuccess ? 'Biometric Verified!' : 'Touch Sensor for Biometric Login'}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Simulates plant optical fingerprint scanner or mobile FaceID token.
            </p>
          </div>
        </div>

        {/* SSO Corporate Login Buttons */}
        <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-center text-[10px] font-mono text-zinc-400 uppercase">
            Corporate Single Sign-On (SSO)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                handleSelectRole('supervisor');
                onClose();
              }}
              className="py-2 px-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-mono flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span>Google Workspace SSO</span>
            </button>
            <button
              onClick={() => {
                handleSelectRole('manager');
                onClose();
              }}
              className="py-2 px-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-mono flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span>Apple Corporate ID</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
