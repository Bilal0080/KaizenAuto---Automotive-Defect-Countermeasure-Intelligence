import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEFAULT_USERS } from '../services/storage';
import { 
  X, 
  Fingerprint, 
  KeyRound, 
  Check, 
  ShieldCheck, 
  User, 
  Lock,
  Sparkles
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [authMethod, setAuthMethod] = useState<'profile' | 'biometric' | 'pin'>('profile');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [pinCode, setPinCode] = useState('');

  if (!isOpen) return null;

  const handleSimulateBiometric = (user: UserProfile) => {
    setIsScanning(true);
    setScanSuccess(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      setTimeout(() => {
        onSelectUser(user);
        onClose();
      }, 700);
    }, 1200);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.length >= 4) {
      // Find matching user or default to supervisor
      const selected = DEFAULT_USERS.find((u) => u.role === 'supervisor') || DEFAULT_USERS[0];
      onSelectUser(selected);
      onClose();
    }
  };

  const roleColors: Record<UserRole, string> = {
    worker: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    inspector: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    supervisor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    manager: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Role-Based Access Control (RBAC) & Authentication
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 bg-slate-950/60 border-b border-slate-800 flex gap-4 text-xs">
          <button
            onClick={() => setAuthMethod('profile')}
            className={`py-2.5 font-medium transition-colors ${
              authMethod === 'profile' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'
            }`}
          >
            Switch Shop Floor Role
          </button>
          <button
            onClick={() => setAuthMethod('biometric')}
            className={`py-2.5 font-medium transition-colors ${
              authMethod === 'biometric' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'
            }`}
          >
            Biometric Scanner
          </button>
          <button
            onClick={() => setAuthMethod('pin')}
            className={`py-2.5 font-medium transition-colors ${
              authMethod === 'pin' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'
            }`}
          >
            Badge PIN
          </button>
        </div>

        <div className="p-6">
          {authMethod === 'profile' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Select your assigned automotive production identity to test role-specific workflows (permissions for line stop, 5-Why approval, report sign-off).
              </p>

              <div className="space-y-2.5">
                {DEFAULT_USERS.map((usr) => {
                  const isCurrent = currentUser.id === usr.id;
                  return (
                    <div
                      key={usr.id}
                      onClick={() => {
                        onSelectUser(usr);
                        onClose();
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'bg-slate-850 border-amber-400 shadow-md ring-1 ring-amber-400'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{usr.name}</span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold border ${
                              roleColors[usr.role]
                            }`}
                          >
                            {usr.role}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {usr.department} · {usr.station}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">{usr.badgeId}</span>
                        {isCurrent && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* External SSO button simulators */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectUser(DEFAULT_USERS[2]);
                    onClose();
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                  </svg>
                  <span>Sign in with Google Workspace</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectUser(DEFAULT_USERS[3]);
                    onClose();
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.66-7.85-11.91-14.42-6.53-10.12-11.43-21.5-14.7-34.15-3.27-12.65-4.9-24.3-4.9-34.95 0-14.15 3.69-25.79 11.07-34.92 7.38-9.13 16.63-13.79 27.76-13.99 4.35 0 9.28 1.15 14.79 3.45 5.51 2.3 9.4 3.51 11.67 3.63 1.96 0 6.08-1.33 12.37-3.99 6.29-2.66 11.85-3.79 16.69-3.39 12.31.65 22.18 5.43 29.62 14.34-10.78 6.53-16.06 15.65-15.84 27.35.22 9.36 3.92 17.2 11.1 23.51 7.18 6.31 15.89 10.02 26.13 11.13-2.18 6.75-4.79 13.43-7.83 20.03zM119.22 31.84c0-7.39 2.61-14.45 7.83-21.18 5.22-6.73 11.75-10.66 19.59-11.78.22 1.09.33 2.18.33 3.27 0 7.39-2.72 14.57-8.16 21.54-5.44 6.97-12.08 10.9-19.92 11.78.11-1.2.33-2.4.33-3.63z" />
                  </svg>
                  <span>Sign in with Apple ID</span>
                </button>
              </div>
            </div>
          )}

          {authMethod === 'biometric' && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div
                onClick={() => handleSimulateBiometric(currentUser)}
                className={`w-28 h-28 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                  isScanning
                    ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/20 animate-pulse'
                    : scanSuccess
                    ? 'border-emerald-500 bg-emerald-500/20 shadow-lg shadow-emerald-500/30'
                    : 'border-slate-700 bg-slate-950 hover:border-amber-400'
                }`}
              >
                {scanSuccess ? (
                  <Check className="w-12 h-12 text-emerald-400" />
                ) : (
                  <Fingerprint className={`w-12 h-12 ${isScanning ? 'text-amber-400' : 'text-slate-400'}`} />
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">
                  {isScanning
                    ? 'Scanning Fingerprint / FaceID...'
                    : scanSuccess
                    ? 'Biometric Signature Verified!'
                    : 'Tap Sensor to Authenticate'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Simulated biometric login for shop-floor operators using terminal touch hardware.
                </p>
              </div>
            </div>
          )}

          {authMethod === 'pin' && (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Enter 4-Digit Station Passcode
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="••••"
                  className="w-full text-center tracking-widest text-lg font-mono py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={pinCode.length < 4}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors"
              >
                Unlock Shop Floor Terminal
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
