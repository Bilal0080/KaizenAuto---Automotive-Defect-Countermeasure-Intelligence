import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  AlertOctagon, 
  Sparkles, 
  Wrench, 
  ShieldCheck,
  Crosshair
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDefect: () => void;
}

const STEPS = [
  {
    title: '1. Fast Defect Identification & Logging',
    tagline: 'Log line issues in under 15 seconds',
    icon: Crosshair,
    color: 'text-amber-400 bg-amber-500/20',
    description:
      'Whether you are at chassis bolting, paint booth, or cockpit marriage, quickly select your station, scan or enter the VIN barcode, and mark the defect severity (Critical, Major, or Minor).',
    tip: 'Tip: You can click directly on the interactive car blueprint wireframe to inspect defects by vehicle zone.',
  },
  {
    title: '2. Instant Andon Line Stop & Supervisor Alert',
    tagline: 'Empowerment to protect vehicle quality',
    icon: AlertOctagon,
    color: 'text-red-400 bg-red-500/20',
    description:
      'Pull the digital Andon cord whenever an out-of-spec torque, missing clip, or safety hazard threatens vehicle integrity. The system immediately pages the shift supervisor and logs the stop-line timestamp.',
    tip: 'Tip: The supervisor receives real-time audio and visual alerts on the Andon board.',
  },
  {
    title: '3. 5-Why & Ishikawa Root Cause Analysis',
    tagline: 'Get to the true root cause, not just the symptom',
    icon: Sparkles,
    color: 'text-cyan-400 bg-cyan-500/20',
    description:
      'Use the built-in AI Kaizen engine or step-by-step 5-Why ladder to drill down from the surface observation to the fundamental process or tooling breakdown.',
    tip: 'Tip: Click "Generate Kaizen Plan" inside any defect to get IATF 16949 compliant suggestions.',
  },
  {
    title: '4. Countermeasures & 8D Verification',
    tagline: 'Track containment, corrective, and preventive actions',
    icon: Wrench,
    color: 'text-emerald-400 bg-emerald-500/20',
    description:
      'Propose immediate interim containment (ICA) to protect the customer, implement permanent corrective actions (PCA), and update standard work instructions so the defect never happens again.',
    tip: 'Tip: Generate printable 8D reports with one click for management audit and supplier review.',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onStartDefect,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white">
              KaizenAuto · Shop Floor Worker Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Visual Body */}
        <div className="p-6 space-y-6 flex-1">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${step.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                Step {currentStep + 1} of {STEPS.length}
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">{step.title}</h3>
              <p className="text-xs font-medium text-slate-400">{step.tagline}</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            {step.description}
          </p>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
            {step.tip}
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 pt-2">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep ? 'w-6 bg-amber-400' : 'w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-30 transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {isLast ? (
            <button
              onClick={() => {
                onClose();
                onStartDefect();
              }}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow"
            >
              <span>Get Started & Log Defect</span>
              <Check className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
